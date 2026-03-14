import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col p-2">
      <div className="flex grow items-center justify-center p-6 lg:rounded-lg lg:bg-white lg:p-10 lg:shadow-xs lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
        <div className="text-center">
          <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400">404</p>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl dark:text-white">
            Page not found
          </h1>

          <p className="mt-6 text-lg font-medium text-gray-500 sm:text-xl/8 dark:text-gray-400">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Go back home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
