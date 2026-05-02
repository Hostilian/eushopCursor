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

export async function setVerifiedBringer(formData: FormData) {
  const userId = formText(formData, 'userId');
  const note = formText(formData, 'note');
  if (!userId) {
    redirect(`/users?err=${encodeURIComponent('User id required')}`);
  }
  const verified = formData.get('verified') === 'true';

  try {
    const trpc = await api();
    await trpc.trust.setVerifiedBringer({
      userId,
      verified,
      note: note.length > 0 ? note : undefined,
    });
  } catch (e) {
    redirect(`/users?err=${encodeURIComponent(trpcOrErrorMessage(e))}`);
  }

  revalidatePath('/users');
  redirect('/users?ok=verified-bringer');
}
