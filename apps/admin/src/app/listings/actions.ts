'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { TRPCError } from '@trpc/server';
import { api } from '../../lib/trpc-server';

function formText(fd: FormData, key: string): string {
  const v = fd.get(key);
  if (typeof v !== 'string') return '';
  return v.trim();
}

function trpcOrErrorMessage(e: unknown): string {
  if (e instanceof TRPCError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Request failed';
}

export async function adminRemoveListing(formData: FormData) {
  const listingId = formText(formData, 'listingId');
  const note = formText(formData, 'note');
  if (!listingId) {
    redirect(`/listings?err=${encodeURIComponent('Listing id required')}`);
  }
  try {
    const trpc = await api();
    await trpc.trust.adminRemoveListing({
      listingId,
      note: note.length > 0 ? note : undefined,
    });
  } catch (e) {
    redirect(`/listings?err=${encodeURIComponent(trpcOrErrorMessage(e))}`);
  }
  revalidatePath('/listings');
  redirect('/listings?ok=removed');
}
