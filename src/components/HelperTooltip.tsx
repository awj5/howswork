import { Tooltip } from "react-tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";

export default function HelperTooltip({ text }: { text: string }) {
  return (
    <>
      <QuestionMarkCircleIcon
        className="hidden size-5 not-dark:sm:inline"
        data-tooltip-id="my-tooltip"
        data-tooltip-content={text}
        data-tooltip-variant={"dark"}
      />

      <QuestionMarkCircleIcon
        className="hidden size-5 dark:sm:inline"
        data-tooltip-id="my-tooltip"
        data-tooltip-content={text}
        data-tooltip-variant={"light"}
      />

      <Tooltip id="my-tooltip" />
    </>
  );
}
