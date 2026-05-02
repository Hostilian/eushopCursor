import { describe, expect, it, vi } from 'vitest';
import { catalogRouter } from './catalog';
import { createCallerFactory } from '../trpc';

/**
 * The catalog router touches several Drizzle tables across both queries and
 * transactions. We replicate just enough of the chainable API to assert the
 * UGC moderation behaviour: duplicate detection on `proposeItem`, error
 * mapping on `proposeImage`, and the approve/reject/duplicate paths on the
 * admin review mutations.
 */

interface CatalogStubs {
  candidates: Map<string, any>;
  images: Map<string, any>;
  foodItems: Map<string, any>;
  countries: Map<string, any>;
  categories: Map<string, any>;
  proposedFoodItems: any[];
  imagesInsertError: any | null;
  // Drives `select(...).from(foodItems).where(barcode=...).limit(3)` results.
  duplicatesByBarcode: any[];
  duplicatesByName: any[];
  moderationLog: any[];
}

function makeStubs(over: Partial<CatalogStubs> = {}): CatalogStubs {
  return {
    candidates: new Map(),
    images: new Map(),
    foodItems: new Map(),
    countries: new Map(),
    categories: new Map(),
    proposedFoodItems: [],
    imagesInsertError: null,
    duplicatesByBarcode: [],
    duplicatesByName: [],
    moderationLog: [],
    ...over,
  };
}

function makeDb(stubs: CatalogStubs) {
  // Each builder yields a thenable that resolves to the supplied value when
  // awaited, so chains like `select().from().where().limit()` and
  // `insert().values().returning()` both Just Work.
  const thenable = (terminator: () => any | Promise<any>): any => {
    const chain: any = {
      from: () => chain,
      where: () => chain,
      orderBy: () => chain,
      groupBy: () => chain,
      innerJoin: () => chain,
      values: (vals: any) => {
        chain.__values = vals;
        return chain;
      },
      set: (vals: any) => {
        chain.__set = vals;
        return chain;
      },
      limit: vi.fn(() => Promise.resolve(terminator())),
      returning: vi.fn(() => Promise.resolve(terminator())),
      then: (resolve: any, reject: any) => Promise.resolve(terminator()).then(resolve, reject),
    };
    return chain;
  };

  // We track the currently-targeted table on each builder so the terminator
  // closure knows what to resolve to. The catalog router uses a small set of
  // distinct call shapes which we identify by matching on the builder's
  // `__values` payload (for inserts) or by call counter for selects.
  const db: any = {
    _selectCounter: 0,
    _selectShapes: [] as Array<() => any>,
    query: {
      foodItemCandidates: {
        findFirst: vi.fn(async ({ where: _ }: any) => stubs._currentCandidate),
      },
      foodItemImageProposals: {
        findFirst: vi.fn(async () => stubs._currentImageProposal),
      },
      foodItems: { findFirst: vi.fn(async () => stubs._currentFoodItem) },
      countries: { findFirst: vi.fn(async () => stubs._currentCountry) },
      categories: { findFirst: vi.fn(async () => stubs._currentCategory) },
    },

    select: vi.fn(() => {
      // Pop the next pre-programmed shape; default to [] if none.
      const next = db._selectShapes.shift?.() ?? (() => []);
      return thenable(next);
    }),
    insert: vi.fn((_table: any) => {
      const next = db._insertShapes.shift?.() ?? (() => [{}]);
      return thenable(next);
    }),
    _insertShapes: [] as Array<() => any>,
    update: vi.fn((_table: any) => {
      const next = db._updateShapes.shift?.() ?? (() => [{}]);
      return thenable(next);
    }),
    _updateShapes: [] as Array<() => any>,
    transaction: vi.fn(async (cb: any) => cb(db)),
  };
  return db;
}

function makeCtx(stubs: CatalogStubs) {
  const db = makeDb(stubs);
  return {
    db,
    meili: {} as any,
    auth: {} as any,
    user: { id: 'admin-1', email: 'a@e.com', role: 'admin' } as any,
    headers: new Headers(),
    enqueueEvent: vi.fn(async () => {}),
  };
}

const callerFactory = createCallerFactory(catalogRouter);

describe('catalogRouter.proposeItem (UGC)', () => {
  it('flags barcode duplicates without skipping the candidate insert', async () => {
    const stubs = makeStubs() as any;
    const ctx = makeCtx(stubs);
    // First select call: the barcode lookup returns 1 row (a duplicate).
    ctx.db._selectShapes.push(() => [
      {
        id: 'dup-1',
        slug: 'kinder-bueno',
        name: 'Kinder Bueno',
        originCountryIso2: 'PL',
        defaultImageUrl: null,
      },
    ]);
    // First insert: the candidate row gets created.
    ctx.db._insertShapes.push(() => [{ id: 'cand-1', name: 'Kinder Bueno' }]);

    const caller = callerFactory(ctx as any);
    const out = await caller.proposeItem({
      name: 'Kinder Bueno',
      categorySlug: 'snacks',
      originCountryIso2: 'PL',
      barcode: '5000159484695',
    } as any);

    expect(out.possibleDuplicates).toHaveLength(1);
    expect(out.possibleDuplicates[0].match).toBe('barcode');
    expect(out.candidate?.id).toBe('cand-1');
  });

  it('falls back to name-based duplicate detection when no barcode is given', async () => {
    const stubs = makeStubs() as any;
    const ctx = makeCtx(stubs);
    // Only one select call: the name lookup.
    ctx.db._selectShapes.push(() => [
      {
        id: 'dup-2',
        slug: 'pierogi-ruskie',
        name: 'Pierogi Ruskie',
        originCountryIso2: 'PL',
        defaultImageUrl: null,
      },
    ]);
    ctx.db._insertShapes.push(() => [{ id: 'cand-2', name: 'Pierogi' }]);

    const caller = callerFactory(ctx as any);
    const out = await caller.proposeItem({
      name: 'Pierogi',
      categorySlug: 'frozen',
      originCountryIso2: 'PL',
    } as any);

    expect(out.possibleDuplicates).toHaveLength(1);
    expect(out.possibleDuplicates[0].match).toBe('name');
  });
});

describe('catalogRouter.proposeImage (UGC)', () => {
  it('maps Postgres 23505 unique-violation to a CONFLICT TRPCError', async () => {
    const stubs = makeStubs() as any;
    stubs._currentFoodItem = { id: 'item-1', defaultImageUrl: null };
    const ctx = makeCtx(stubs);
    ctx.db._insertShapes.push(() => {
      const err: any = new Error('duplicate key value violates unique constraint');
      err.code = '23505';
      throw err;
    });

    const caller = callerFactory(ctx as any);
    await expect(
      caller.proposeImage({
        foodItemId: '00000000-0000-0000-0000-000000000001',
        url: 'https://example.com/x.jpg',
        source: 'user-url',
      } as any),
    ).rejects.toMatchObject({
      code: 'CONFLICT',
      message: /already proposed/i,
    });
  });

  it('maps unknown errors to INTERNAL_SERVER_ERROR with a safe message', async () => {
    const stubs = makeStubs() as any;
    stubs._currentFoodItem = { id: 'item-1', defaultImageUrl: null };
    const ctx = makeCtx(stubs);
    ctx.db._insertShapes.push(() => {
      throw new Error('something went sideways');
    });

    const caller = callerFactory(ctx as any);
    await expect(
      caller.proposeImage({
        foodItemId: '00000000-0000-0000-0000-000000000001',
        url: 'https://example.com/x.jpg',
        source: 'user-url',
      } as any),
    ).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      message: /Could not save image proposal/i,
    });
  });
});

describe('catalogRouter.adminReviewFoodItemCandidate', () => {
  it('rejects when the candidate is not pending', async () => {
    const stubs = makeStubs() as any;
    stubs._currentCandidate = { id: 'cand-x', status: 'approved' };
    const ctx = makeCtx(stubs);
    const caller = callerFactory(ctx as any);
    await expect(
      caller.adminReviewFoodItemCandidate({
        id: '00000000-0000-0000-0000-000000000010',
        status: 'approved',
      } as any),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST', message: /not pending/i });
  });

  it('rejects (status=rejected) and writes a moderation_actions row', async () => {
    const stubs = makeStubs() as any;
    stubs._currentCandidate = {
      id: 'cand-x',
      status: 'pending',
      name: 'Bad Item',
      originCountryIso2: 'PL',
      categorySlug: 'snacks',
      proposedImages: [],
    };
    const ctx = makeCtx(stubs);
    // update candidate, then insert moderationActions
    ctx.db._updateShapes.push(() => [{}]);
    ctx.db._insertShapes.push(() => [{}]);

    const caller = callerFactory(ctx as any);
    const out = (await caller.adminReviewFoodItemCandidate({
      id: '00000000-0000-0000-0000-000000000010',
      status: 'rejected',
      moderatorNote: 'spam',
    } as any)) as any;

    expect(out.action).toBe('rejected');
    expect(ctx.db.update).toHaveBeenCalled();
    expect(ctx.db.insert).toHaveBeenCalled();
  });

  it('flags duplicate when mergedIntoItemId is given', async () => {
    const stubs = makeStubs() as any;
    stubs._currentCandidate = {
      id: 'cand-y',
      status: 'pending',
      name: 'Same Item',
      originCountryIso2: 'PL',
      categorySlug: 'snacks',
      proposedImages: [],
    };
    // The duplicate-merge path looks up the food item to merge into.
    stubs._currentFoodItem = { id: 'item-merge-1' };
    const ctx = makeCtx(stubs);
    ctx.db._updateShapes.push(() => [{}]);
    ctx.db._insertShapes.push(() => [{}]);

    const caller = callerFactory(ctx as any);
    const out = (await caller.adminReviewFoodItemCandidate({
      id: '00000000-0000-0000-0000-000000000020',
      status: 'duplicate',
      mergedIntoItemId: '00000000-0000-0000-0000-000000000099',
    } as any)) as any;

    expect(out.action).toBe('duplicate');
    expect(out.mergedIntoItemId).toBe('item-merge-1');
  });
});

describe('catalogRouter.adminReviewFoodItemImageProposal', () => {
  it('rejects when the proposal is not pending', async () => {
    const stubs = makeStubs() as any;
    stubs._currentImageProposal = { id: 'img-x', status: 'approved' };
    const ctx = makeCtx(stubs);
    const caller = callerFactory(ctx as any);
    await expect(
      caller.adminReviewFoodItemImageProposal({
        id: '00000000-0000-0000-0000-000000000030',
        status: 'approved',
      } as any),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST', message: /not pending/i });
  });

  it('only sets default image when the food item has none', async () => {
    const stubs = makeStubs() as any;
    stubs._currentImageProposal = {
      id: 'img-y',
      status: 'pending',
      foodItemId: 'item-y',
      url: 'https://cdn.example/p.jpg',
      source: 'user',
    };
    stubs._currentFoodItem = { id: 'item-y', defaultImageUrl: null };
    const ctx = makeCtx(stubs);
    // updates: foodItems, foodItemImageProposals; insert: moderationActions
    ctx.db._updateShapes.push(() => [{}]);
    ctx.db._updateShapes.push(() => [{}]);
    ctx.db._insertShapes.push(() => [{}]);

    const caller = callerFactory(ctx as any);
    const out = (await caller.adminReviewFoodItemImageProposal({
      id: '00000000-0000-0000-0000-000000000040',
      status: 'approved',
    } as any)) as any;

    expect(out.ok).toBe(true);
    // Food item update + proposal update both fired.
    expect(ctx.db.update).toHaveBeenCalledTimes(2);
    // Reindex enqueued because the default image flipped.
    expect(ctx.enqueueEvent).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'catalog.reindex' }),
    );
  });

  it('does NOT touch the food item when a default image already exists', async () => {
    const stubs = makeStubs() as any;
    stubs._currentImageProposal = {
      id: 'img-z',
      status: 'pending',
      foodItemId: 'item-z',
      url: 'https://cdn.example/p.jpg',
      source: 'user',
    };
    stubs._currentFoodItem = {
      id: 'item-z',
      defaultImageUrl: 'https://existing/already.jpg',
    };
    const ctx = makeCtx(stubs);
    // Only the proposal update + moderation insert run when patch is empty.
    ctx.db._updateShapes.push(() => [{}]);
    ctx.db._insertShapes.push(() => [{}]);

    const caller = callerFactory(ctx as any);
    const out = (await caller.adminReviewFoodItemImageProposal({
      id: '00000000-0000-0000-0000-000000000050',
      status: 'approved',
    } as any)) as any;

    expect(out.ok).toBe(true);
    expect(ctx.db.update).toHaveBeenCalledTimes(1);
    // Reindex skipped because nothing changed on the food item.
    expect(ctx.enqueueEvent).not.toHaveBeenCalled();
  });
});
