export default function ProductLoading() {
  return (
    <div
      className="bg-paper flex min-h-[40vh] items-center justify-center px-6 py-24"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-ash text-sm">Loading…</p>
    </div>
  );
}
