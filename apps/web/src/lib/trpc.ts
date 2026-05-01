import type { AppRouter } from '@eushop/api-router';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();

export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
