'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { TRPCError } from '@trpc/server';
import { api } from '../../../lib/trpc-server';

function formText(fd: FormData, key: string): string {
  const v = fd.get(key);
  if (typeof v !== 'string') return '';
  return v.trim();
}

function optionalNote(fd: FormData): string | undefined {
  const n = formText(fd, 'moderatorNote');
  return n.length > 0 ? n : undefined;
}

function trpcOrErrorMessage(e: unknown): string {
  if (e instanceof TRPCError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Request failed';
}

function buildReturnUrl(qs: URLSearchParams): string {
  const s = qs.toString();
  return s.length > 0 ? `/catalog/ugc?${s}` : '/catalog/ugc';
}

function preserveFilters(fd: FormData): URLSearchParams {
  const qs = new URLSearchParams();
  for (const k of [
    'candidateStatus',
    'imageProposalStatus',
    'countryIso2',
    'categorySlug',
    'submitterId',
  ]) {
    const v = formText(fd, k);
    if (v) qs.set(k, v);
  }
  return qs;
}

function errRedirect(e: unknown, qs: URLSearchParams): never {
  qs.set('err', trpcOrErrorMessage(e));
  redirect(`/catalog/ugc?${qs.toString()}`);
}

function okRedirect(qs: URLSearchParams): never {
  revalidatePath('/catalog/ugc');
  redirect(buildReturnUrl(qs));
}

export async function reviewFoodItemCandidate(formData: FormData) {
  const id = formText(formData, 'id');
  const status = formText(formData, 'status') as 'approved' | 'rejected' | 'duplicate' | '';
  const mergedIntoItemIdRaw = formText(formData, 'mergedIntoItemId');
  const mergedIntoItemId = mergedIntoItemIdRaw.length > 0 ? mergedIntoItemIdRaw : undefined;
  const moderatorNote = optionalNote(formData);
  const qs = preserveFilters(formData);

  if (!id || !status) errRedirect(new Error('Missing candidate id or status'), qs);

  try {
    const trpc = await api();
    await trpc.catalog.adminReviewFoodItemCandidate({
      id,
      status,
      mergedIntoItemId: status === 'duplicate' ? mergedIntoItemId : undefined,
      moderatorNote,
    });
  } catch (e) {
    errRedirect(e, qs);
  }
  okRedirect(qs);
}

export async function reviewFoodItemImageProposal(formData: FormData) {
  const id = formText(formData, 'id');
  const status = formText(formData, 'status') as 'approved' | 'rejected' | '';
  const moderatorNote = optionalNote(formData);
  const qs = preserveFilters(formData);

  if (!id || !status) errRedirect(new Error('Missing proposal id or status'), qs);

  try {
    const trpc = await api();
    await trpc.catalog.adminReviewFoodItemImageProposal({ id, status, moderatorNote });
  } catch (e) {
    errRedirect(e, qs);
  }
  okRedirect(qs);
}

export async function bulkReviewFoodItemCandidates(formData: FormData) {
  const status = formText(formData, 'status') as 'approved' | 'rejected' | '';
  const ids = formData
    .getAll('ids')
    .map((v) => String(v).trim())
    .filter(Boolean);
  const moderatorNote = optionalNote(formData);
  const qs = preserveFilters(formData);
  if (!status || ids.length === 0) errRedirect(new Error('Select at least one row'), qs);
  try {
    const trpc = await api();
    await trpc.catalog.adminBulkReviewFoodItemCandidates({ ids, status, moderatorNote });
  } catch (e) {
    errRedirect(e, qs);
  }
  okRedirect(qs);
}

export async function bulkReviewFoodItemImageProposals(formData: FormData) {
  const status = formText(formData, 'status') as 'approved' | 'rejected' | '';
  const ids = formData
    .getAll('ids')
    .map((v) => String(v).trim())
    .filter(Boolean);
  const moderatorNote = optionalNote(formData);
  const qs = preserveFilters(formData);
  if (!status || ids.length === 0) errRedirect(new Error('Select at least one row'), qs);
  try {
    const trpc = await api();
    await trpc.catalog.adminBulkReviewFoodItemImageProposals({ ids, status, moderatorNote });
  } catch (e) {
    errRedirect(e, qs);
  }
  okRedirect(qs);
}
