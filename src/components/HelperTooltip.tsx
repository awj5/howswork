import { Tooltip } from "react-tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";

export default function HelperTooltip({ text }: { text: string }) {
  return (
    <>
      {/* Light mode version */}
      <span
        className="hidden text-zinc-950 not-dark:md:inline"
        tabIndex={0}
        aria-label={text}
        data-tooltip-id="my-tooltip"
        data-tooltip-content={text}
        data-tooltip-variant="dark"
      >
        <QuestionMarkCircleIcon aria-hidden="true" className="size-5" />
      </span>

      {/* Dark mode version */}
      <span
        className="hidden text-white dark:md:inline"
        tabIndex={0}
        aria-label={text}
        data-tooltip-id="my-tooltip"
        data-tooltip-content={text}
        data-tooltip-variant="light"
      >
        <QuestionMarkCircleIcon aria-hidden="true" className="size-5" />
      </span>

      <Tooltip id="my-tooltip" />
    </>
  );
}
