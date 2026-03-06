import clsx from "clsx";

type EmptyStateProps = {
  children: React.ReactNode;
  className?: string;
};

export default function EmptyState(props: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "fixed top-1/2 left-1/2 flex h-80 w-xs -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center sm:w-sm lg:left-[calc(50%+128px)]",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}
