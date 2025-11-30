import { useEffect } from "react";

export function useUnsavedWarning(vals: [string | undefined, string | undefined][]) {
  useEffect(() => {
    const listener = (e: BeforeUnloadEvent) => {
      // Warn that changes have not been saved
      if (vals.some(([current, initial]) => current !== initial)) e.preventDefault();
    };

    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  }, [vals]);
}
