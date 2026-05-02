import Link from 'next/link';
import { api } from '../../../lib/trpc-server';
import {
  bulkReviewFoodItemCandidates,
  bulkReviewFoodItemImageProposals,
  reviewFoodItemCandidate,
  reviewFoodItemImageProposal,
} from './actions';

type CandidateStatus = 'pending' | 'approved' | 'rejected' | 'duplicate';
type ImageStatus = 'pending' | 'approved' | 'rejected';

function parseCandidateStatus(v: unknown): CandidateStatus {
  const allowed: CandidateStatus[] = ['pending', 'approved', 'rejected', 'duplicate'];
  return typeof v === 'string' && (allowed as string[]).includes(v)
    ? (v as CandidateStatus)
    : 'pending';
}
function parseImageStatus(v: unknown): ImageStatus {
  const allowed: ImageStatus[] = ['pending', 'approved', 'rejected'];
  return typeof v === 'string' && (allowed as string[]).includes(v)
    ? (v as ImageStatus)
    : 'pending';
}
function pickStr(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

type CatalogUgcPageProps = Readonly<{
  searchParams: Promise<{
    err?: string;
    candidateStatus?: string;
    imageProposalStatus?: string;
    countryIso2?: string;
    categorySlug?: string;
    submitterId?: string;
  }>;
}>;

export default async function CatalogUgcPage({ searchParams }: CatalogUgcPageProps) {
  const sp = await searchParams;
  const actionErr = typeof sp.err === 'string' ? decodeURIComponent(sp.err) : null;
  const filters = {
    candidateStatus: parseCandidateStatus(sp.candidateStatus),
    imageProposalStatus: parseImageStatus(sp.imageProposalStatus),
    countryIso2: pickStr(sp.countryIso2)?.toUpperCase(),
    categorySlug: pickStr(sp.categorySlug),
    submitterId: pickStr(sp.submitterId),
  };

  let loadError: string | null = null;
  let candidates: Array<{
    id: string;
    name: string;
    categorySlug: string;
    originCountryIso2: string;
    description: string | null;
    barcode: string | null;
    proposedImages: { url: string; source?: string }[];
    submittedById: string;
    status: CandidateStatus;
  }> = [];
  let imageProposals: Array<{
    proposal: {
      id: string;
      url: string;
      source: string;
      votes: number;
      submittedById: string;
      status: ImageStatus;
    };
    itemName: string;
    itemSlug: string;
  }> = [];

  try {
    const trpc = await api();
    const data = await trpc.catalog.adminCatalogUgcQueue(filters);
    candidates = data.candidates as typeof candidates;
    imageProposals = data.imageProposals as typeof imageProposals;
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Could not load catalog UGC queues.';
  }

  const filterHidden = (
    <>
      <input type="hidden" name="candidateStatus" value={filters.candidateStatus} />
      <input type="hidden" name="imageProposalStatus" value={filters.imageProposalStatus} />
      {filters.countryIso2 ? (
        <input type="hidden" name="countryIso2" value={filters.countryIso2} />
      ) : null}
      {filters.categorySlug ? (
        <input type="hidden" name="categorySlug" value={filters.categorySlug} />
      ) : null}
      {filters.submitterId ? (
        <input type="hidden" name="submitterId" value={filters.submitterId} />
      ) : null}
    </>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-ink font-serif text-3xl">Catalog UGC</h1>
          <p className="text-ink/70 mt-2 max-w-2xl text-sm">
            Review proposed products and pending alternate images. Approving a candidate inserts a
            canonical <code className="text-ink/80 font-mono text-xs">food_items</code> row; marking
            duplicate requires an existing item UUID to merge into. Filters and bulk actions live
            below.
          </p>
        </div>
        <Link
          href="/catalog"
          className="text-ink/70 hover:text-ink text-sm font-medium underline-offset-4 hover:underline"
        >
          ← Catalog overview
        </Link>
      </div>

      <form
        method="GET"
        className="border-ink/10 bg-porcelain/40 grid gap-3 rounded-2xl border p-4 md:grid-cols-5"
        aria-label="Catalog UGC filters"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-candidateStatus" className="text-ash text-xs uppercase">
            Candidate status
          </label>
          <select
            id="filter-candidateStatus"
            name="candidateStatus"
            defaultValue={filters.candidateStatus}
            className="border-ink/15 bg-paper text-ink rounded-xl border px-3 py-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="duplicate">Duplicate</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-imageProposalStatus" className="text-ash text-xs uppercase">
            Image status
          </label>
          <select
            id="filter-imageProposalStatus"
            name="imageProposalStatus"
            defaultValue={filters.imageProposalStatus}
            className="border-ink/15 bg-paper text-ink rounded-xl border px-3 py-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-countryIso2" className="text-ash text-xs uppercase">
            Country (ISO2)
          </label>
          <input
            id="filter-countryIso2"
            name="countryIso2"
            defaultValue={filters.countryIso2 ?? ''}
            placeholder="e.g. PL"
            maxLength={2}
            className="border-ink/15 bg-paper text-ink rounded-xl border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-categorySlug" className="text-ash text-xs uppercase">
            Category slug
          </label>
          <input
            id="filter-categorySlug"
            name="categorySlug"
            defaultValue={filters.categorySlug ?? ''}
            placeholder="snacks"
            className="border-ink/15 bg-paper text-ink rounded-xl border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-submitterId" className="text-ash text-xs uppercase">
            Submitter UUID
          </label>
          <input
            id="filter-submitterId"
            name="submitterId"
            defaultValue={filters.submitterId ?? ''}
            placeholder="user UUID"
            className="border-ink/15 bg-paper text-ink rounded-xl border px-3 py-2 font-mono text-xs"
          />
        </div>
        <div className="md:col-span-5">
          <button
            type="submit"
            className="bg-ink text-paper hover:bg-ink/90 rounded-xl px-4 py-2 text-sm font-medium"
          >
            Apply filters
          </button>
        </div>
      </form>

      {loadError ? (
        <div className="border-danger/30 bg-danger/5 text-danger rounded-2xl border p-4 text-sm">
          {loadError}
        </div>
      ) : null}

      {actionErr ? (
        <div
          role="alert"
          aria-live="polite"
          className="border-danger/30 bg-danger/5 text-danger rounded-2xl border p-4 text-sm"
        >
          {actionErr}
        </div>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-ink font-serif text-xl">Product candidates</h2>
        <form
          action={bulkReviewFoodItemCandidates}
          className="border-ink/10 bg-porcelain/30 rounded-2xl border p-4"
        >
          {filterHidden}
          <p className="text-ash mb-3 text-xs uppercase">Bulk action</p>
          <div className="flex flex-wrap items-end gap-2">
            <label htmlFor="bulk-cand-note" className="sr-only">
              Bulk moderator note
            </label>
            <input
              id="bulk-cand-note"
              name="moderatorNote"
              placeholder="Bulk note (optional)"
              className="border-ink/15 bg-paper text-ink min-w-[220px] rounded-xl border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              name="status"
              value="approved"
              className="bg-ink text-paper rounded-xl px-3 py-1.5 text-sm font-medium"
            >
              Approve selected
            </button>
            <button
              type="submit"
              name="status"
              value="rejected"
              className="border-ink/20 text-ink rounded-xl border px-3 py-1.5 text-sm"
            >
              Reject selected
            </button>
          </div>
          {candidates.length === 0 && !loadError ? (
            <p className="text-ink/60 mt-4 text-sm">No candidates match the current filter.</p>
          ) : (
            <ul className="mt-4 grid gap-4">
              {candidates.map((c) => (
                <li key={c.id} className="border-ink/10 bg-paper rounded-2xl border p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="ids"
                      value={c.id}
                      id={`select-cand-${c.id}`}
                      className="mt-1.5"
                      aria-label={`Select candidate ${c.name}`}
                    />
                    <div className="flex-1">
                      <p className="text-ash font-mono text-xs">{c.id}</p>
                      <label
                        htmlFor={`select-cand-${c.id}`}
                        className="text-ink mt-1 block font-serif text-xl"
                      >
                        {c.name}
                      </label>
                      <p className="text-ink/70 mt-2 text-sm">
                        {c.categorySlug} · {c.originCountryIso2}
                        {c.barcode ? <> · barcode {c.barcode}</> : null}
                      </p>
                      <p className="text-ink/50 mt-1 font-mono text-[10px]">
                        submitter {c.submittedById}
                      </p>
                      {c.description ? (
                        <p className="text-ink/80 mt-2 text-sm">{c.description}</p>
                      ) : null}
                      {c.proposedImages.length > 0 ? (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {c.proposedImages.slice(0, 4).map((img) => (
                            <li
                              key={`${c.id}-${img.url}`}
                              className="border-ink/10 overflow-hidden rounded-lg border"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.url}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                alt=""
                                className="h-20 w-20 object-cover"
                              />
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {filters.candidateStatus === 'pending' ? (
                        <PerCandidateActions id={c.id} filterHidden={filterHidden} />
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-ink font-serif text-xl">Image proposals</h2>
        <form
          action={bulkReviewFoodItemImageProposals}
          className="border-ink/10 bg-porcelain/30 rounded-2xl border p-4"
        >
          {filterHidden}
          <p className="text-ash mb-3 text-xs uppercase">Bulk action</p>
          <div className="flex flex-wrap items-end gap-2">
            <label htmlFor="bulk-img-note" className="sr-only">
              Bulk moderator note
            </label>
            <input
              id="bulk-img-note"
              name="moderatorNote"
              placeholder="Bulk note (optional)"
              className="border-ink/15 bg-paper text-ink min-w-[220px] rounded-xl border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              name="status"
              value="approved"
              className="bg-ink text-paper rounded-xl px-3 py-1.5 text-sm font-medium"
            >
              Approve selected
            </button>
            <button
              type="submit"
              name="status"
              value="rejected"
              className="border-ink/20 text-ink rounded-xl border px-3 py-1.5 text-sm"
            >
              Reject selected
            </button>
          </div>
          {imageProposals.length === 0 && !loadError ? (
            <p className="text-ink/60 mt-4 text-sm">No image proposals match the current filter.</p>
          ) : (
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {imageProposals.map(({ proposal, itemName, itemSlug }) => (
                <li
                  key={proposal.id}
                  className="border-ink/10 bg-paper flex flex-col rounded-2xl border p-4 shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      name="ids"
                      value={proposal.id}
                      id={`select-img-${proposal.id}`}
                      className="mt-1.5"
                      aria-label={`Select image proposal for ${itemName}`}
                    />
                    <div className="flex-1">
                      <p className="text-ash font-mono text-xs">{proposal.id}</p>
                      <label
                        htmlFor={`select-img-${proposal.id}`}
                        className="text-ink mt-1 block font-medium"
                      >
                        {itemName}
                      </label>
                      <p className="text-ash font-mono text-xs">{itemSlug}</p>
                      <p className="text-ink/60 mt-1 text-xs">
                        {proposal.votes} votes · {proposal.source} · submitter{' '}
                        {proposal.submittedById}
                      </p>
                      <div className="border-ink/10 mt-3 overflow-hidden rounded-lg border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proposal.url}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          alt=""
                          className="max-h-40 w-full object-contain"
                        />
                      </div>
                      {filters.imageProposalStatus === 'pending' ? (
                        <PerImageActions id={proposal.id} filterHidden={filterHidden} />
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </form>
      </section>
    </div>
  );
}

function PerCandidateActions({ id, filterHidden }: { id: string; filterHidden: React.ReactNode }) {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <form
        action={reviewFoodItemCandidate}
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        {filterHidden}
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="approved" />
        <label htmlFor={`approve-note-${id}`} className="sr-only">
          Approval note
        </label>
        <input
          id={`approve-note-${id}`}
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
        {filterHidden}
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="rejected" />
        <label htmlFor={`reject-note-${id}`} className="sr-only">
          Rejection note
        </label>
        <input
          id={`reject-note-${id}`}
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
      <form
        action={reviewFoodItemCandidate}
        className="border-ink/10 mt-2 flex w-full flex-col gap-2 rounded-xl border border-dashed p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        {filterHidden}
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="duplicate" />
        <div className="min-w-[200px] flex-1">
          <label
            htmlFor={`merge-id-${id}`}
            className="text-ash block text-xs tracking-wide uppercase"
          >
            Existing food_items.id
          </label>
          <input
            id={`merge-id-${id}`}
            name="mergedIntoItemId"
            required
            placeholder="UUID of canonical item"
            className="border-ink/15 bg-paper text-ink mt-1 w-full rounded-xl border px-3 py-2 font-mono text-sm"
          />
        </div>
        <label htmlFor={`dupe-note-${id}`} className="sr-only">
          Duplicate note
        </label>
        <input
          id={`dupe-note-${id}`}
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
    </div>
  );
}

function PerImageActions({ id, filterHidden }: { id: string; filterHidden: React.ReactNode }) {
  return (
    <form action={reviewFoodItemImageProposal} className="mt-4 space-y-2">
      {filterHidden}
      <input type="hidden" name="id" value={id} />
      <label htmlFor={`img-note-${id}`} className="sr-only">
        Moderator note
      </label>
      <input
        id={`img-note-${id}`}
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
  );
}
