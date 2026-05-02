import { SAMPLE_USERS } from '@eushop/mock-data';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-ink font-serif text-3xl">Users</h1>
      <p className="text-ink/70 max-w-xl text-sm">
        Demo personas when the directory is empty — swap for real profiles once auth-backed admin
        ships.
      </p>
      <ul className="grid gap-4 md:grid-cols-2">
        {SAMPLE_USERS.map((u) => (
          <li key={u.id} className="border-ink/10 rounded-2xl border bg-white p-5">
            <p className="text-ink font-serif text-xl">{u.name}</p>
            <p className="text-ash mt-1 text-sm">
              {u.city}, {u.countryIso2} · from {u.origin}
            </p>
            <p className="text-ink/70 mt-3 text-sm">{u.bio}</p>
            <p className="text-saffron-700 mt-2 text-xs">Trust {u.trustScore}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
