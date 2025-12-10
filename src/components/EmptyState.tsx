export default function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed top-1/2 left-1/2 flex h-80 w-80 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center p-4 lg:left-[calc(50%+128px)]">
      {children}
    </div>
  );
}
