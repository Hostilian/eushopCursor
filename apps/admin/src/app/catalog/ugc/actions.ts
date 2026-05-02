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

function errRedirect(e: unknown): never {
  redirect(`/catalog/ugc?err=${encodeURIComponent(trpcOrErrorMessage(e))}`);
}

export async function reviewFoodItemCandidate(formData: FormData) {
  const id = formText(formData, 'id');
  const status = formText(formData, 'status') as 'approved' | 'rejected' | 'duplicate' | '';
  const mergedIntoItemIdRaw = formText(formData, 'mergedIntoItemId');
  const mergedIntoItemId = mergedIntoItemIdRaw.length > 0 ? mergedIntoItemIdRaw : undefined;
  const moderatorNote = optionalNote(formData);

  if (!id || !status) errRedirect(new Error('Missing candidate id or status'));

  try {
    const trpc = await api();
    await trpc.catalog.adminReviewFoodItemCandidate({
      id,
      status,
      mergedIntoItemId: status === 'duplicate' ? mergedIntoItemId : undefined,
      moderatorNote,
    });
  } catch (e) {
    errRedirect(e);
  }
  revalidatePath('/catalog/ugc');
  redirect('/catalog/ugc');
}

export async function reviewFoodItemImageProposal(formData: FormData) {
  const id = formText(formData, 'id');
  const status = formText(formData, 'status') as 'approved' | 'rejected' | '';
  const moderatorNote = optionalNote(formData);

  if (!id || !status) errRedirect(new Error('Missing proposal id or status'));

  try {
    const trpc = await api();
    await trpc.catalog.adminReviewFoodItemImageProposal({ id, status, moderatorNote });
  } catch (e) {
    errRedirect(e);
  }
  revalidatePath('/catalog/ugc');
  redirect('/catalog/ugc');
}
