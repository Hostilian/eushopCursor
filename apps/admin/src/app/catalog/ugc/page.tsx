import Link from 'next/link';
import { api } from '../../../lib/trpc-server';
import { reviewFoodItemCandidate, reviewFoodItemImageProposal } from './actions';

type CatalogUgcPageProps = Readonly<{
  searchParams: Promise<{ err?: string }>;
}>;

export default async function CatalogUgcPage({ searchParams }: CatalogUgcPageProps) {
  const sp = await searchParams;
  const actionErr = typeof sp.err === 'string' ? decodeURIComponent(sp.err) : null;

  let loadError: string | null = null;
  let candidates: {
    id: string;
    name: string;
    categorySlug: string;
    originCountryIso2: string;
    description: string | null;
    proposedImages: { url: string; source?: string }[];
  }[] = [];
  let imageProposals: {
    proposal: {
      id: string;
      url: string;
      source: string;
      votes: number;
    };
    itemName: string;
    itemSlug: string;
  }[] = [];

  try {
    const trpc = await api();
    const data = await trpc.catalog.adminCatalogUgcQueue({});
    candidates = data.candidates;
    imageProposals = data.imageProposals;
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Could not load catalog UGC queues.';
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-ink font-serif text-3xl">Catalog UGC</h1>
          <p className="text-ink/70 mt-2 max-w-2xl text-sm">
            Review proposed products and pending alternate images. Approving a candidate inserts a
            canonical <code className="text-ink/80 font-mono text-xs">food_items</code> row; marking
            duplicate requires an existing item UUID to merge into.
          </p>
        </div>
        <Link
          href="/catalog"
          className="text-ink/70 hover:text-ink text-sm font-medium underline-offset-4 hover:underline"
        >
          ← Catalog overview
        </Link>
      </div>

      {loadError ? (
        <div className="border-danger/30 bg-danger/5 text-danger rounded-2xl border p-4 text-sm">
          {loadError}
        </div>
      ) : null}

      {actionErr ? (
        <div className="border-danger/30 bg-danger/5 text-danger rounded-2xl border p-4 text-sm">
          {actionErr}
        </div>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-ink font-serif text-xl">Product candidates</h2>
        {candidates.length === 0 && !loadError ? (
          <p className="text-ink/60 text-sm">No pending product proposals.</p>
        ) : (
          <ul className="grid gap-4">
            {candidates.map((c) => (
              <li
                key={c.id}
                className="border-ink/10 bg-porcelain/40 rounded-2xl border p-5 shadow-sm"
              >
                <p className="text-ash font-mono text-xs">{c.id}</p>
                <p className="text-ink mt-1 font-serif text-xl">{c.name}</p>
                <p className="text-ink/70 mt-2 text-sm">
                  {c.categorySlug} · {c.originCountryIso2}
                </p>
                {c.description ? <p className="text-ink/80 mt-2 text-sm">{c.description}</p> : null}
                {c.proposedImages.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {c.proposedImages.slice(0, 4).map((img) => (
                      <li
                        key={`${c.id}-${img.url}`}
                        className="border-ink/10 overflow-hidden rounded-lg border"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="" className="h-20 w-20 object-cover" />
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-3">
                  <form
                    action={reviewFoodItemCandidate}
                    className="flex flex-col gap-2 sm:flex-row sm:items-end"
                  >
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value="approved" />
                    <input
                      name="moderatorNote"
                      placeholder="Note (optional)"
                      className="border-ink/15 bg-paper text-ink min-w-[180px] rounded-xl border px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      className="bg-ink text-paper hover:bg-ink/90 rounded-xl px-4 py-2 text-sm font-medium"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={reviewFoodItemCandidate} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <input
                      name="moderatorNote"
                      placeholder="Note (optional)"
                      className="border-ink/15 bg-paper text-ink rounded-xl border px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      className="border-ink/20 text-ink hover:bg-paper rounded-xl border px-4 py-2 text-sm font-medium"
                    >
                      Reject
                    </button>
                  </form>
                </div>

                <form
                  action={reviewFoodItemCandidate}
                  className="border-ink/10 mt-4 flex flex-col gap-2 rounded-xl border border-dashed p-4 sm:flex-row sm:flex-wrap sm:items-end"
                >
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="status" value="duplicate" />
                  <div className="min-w-[200px] flex-1">
                    <label
                      htmlFor={`merge-id-${c.id}`}
                      className="text-ash block text-xs tracking-wide uppercase"
                    >
                      Existing food_items.id
                    </label>
                    <input
                      id={`merge-id-${c.id}`}
                      name="mergedIntoItemId"
                      required
                      placeholder="UUID of canonical item"
                      className="border-ink/15 bg-paper text-ink mt-1 w-full rounded-xl border px-3 py-2 font-mono text-sm"
                    />
                  </div>
                  <input
                    name="moderatorNote"
                    placeholder="Note (optional)"
                    className="border-ink/15 bg-paper text-ink min-w-[160px] flex-1 rounded-xl border px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="text-ink border-saffron-400/40 hover:bg-saffron-400/10 rounded-xl border px-4 py-2 text-sm font-medium"
                  >
                    Mark duplicate
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-ink font-serif text-xl">Image proposals</h2>
        {imageProposals.length === 0 && !loadError ? (
          <p className="text-ink/60 text-sm">No pending image proposals.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {imageProposals.map(({ proposal, itemName, itemSlug }) => (
              <li
                key={proposal.id}
                className="border-ink/10 bg-porcelain/40 flex flex-col rounded-2xl border p-4 shadow-sm"
              >
                <p className="text-ash font-mono text-xs">{proposal.id}</p>
                <p className="text-ink mt-1 font-medium">{itemName}</p>
                <p className="text-ash font-mono text-xs">{itemSlug}</p>
                <p className="text-ink/60 mt-1 text-xs">
                  {proposal.votes} votes · {proposal.source}
                </p>
                <div className="border-ink/10 mt-3 overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proposal.url} alt="" className="max-h-40 w-full object-contain" />
                </div>
                <form action={reviewFoodItemImageProposal} className="mt-4 space-y-2">
                  <input type="hidden" name="id" value={proposal.id} />
                  <input
                    name="moderatorNote"
                    placeholder="Moderator note (optional)"
                    className="border-ink/15 bg-paper text-ink w-full rounded-xl border px-3 py-2 text-sm"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      name="status"
                      value="approved"
                      className="bg-ink text-paper rounded-xl px-3 py-1.5 text-sm font-medium"
                    >
                      Approve
                    </button>
                    <button
                      type="submit"
                      name="status"
                      value="rejected"
                      className="border-ink/20 text-ink rounded-xl border px-3 py-1.5 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
