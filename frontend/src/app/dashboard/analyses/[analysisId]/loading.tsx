export default function Loading() {
  return (
    <div className="min-h-full bg-gray-950">
      <header className="border-b border-gray-800 px-8 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-80 animate-pulse rounded-lg bg-gray-800" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl bg-gray-900" />
          <div className="h-40 animate-pulse rounded-2xl bg-gray-900" />
        </div>

        <div className="h-80 animate-pulse rounded-2xl bg-gray-900" />

        <div className="h-56 animate-pulse rounded-2xl bg-gray-900" />
      </main>
    </div>
  );
}