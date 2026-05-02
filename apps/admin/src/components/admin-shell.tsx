import Link from 'next/link';
import type { ReactNode } from 'react';

const nav = [
  { href: '/', label: 'Overview' },
  { href: '/listings', label: 'Listings' },
  { href: '/requests', label: 'Requests' },
  { href: '/users', label: 'Users' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/audit', label: 'Audit log' },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-paper text-ink flex min-h-screen">
      <aside className="border-ink/10 bg-parchment/40 hidden w-56 shrink-0 flex-col border-r md:flex">
        <div className="border-ink/10 border-b p-5">
          <p className="font-serif text-xl tracking-tight">Eushop</p>
          <p className="text-ash mt-1 text-xs tracking-widest uppercase">Admin</p>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink/85 hover:bg-paper rounded-xl px-3 py-2 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="border-ink/10 bg-paper/90 flex h-14 items-center border-b px-4 backdrop-blur md:hidden">
          <p className="font-serif text-lg">Eushop Admin</p>
        </header>
        <div className="container-admin py-8">{children}</div>
      </div>
    </div>
  );
}
