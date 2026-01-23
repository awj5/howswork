import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/16/solid";

export default function Breadcrumb({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <div className="max-lg:hidden">
      <Link className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400" href={href}>
        <ChevronLeftIcon className="size-4" />
        {children}
      </Link>
    </div>
  );
}
