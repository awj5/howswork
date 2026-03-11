import { SparklesIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/ui/button";

type SuggestActionsProps = {
  disabled: boolean;
};

export default function SuggestActions(props: SuggestActionsProps) {
  return (
    <Button
      onClick={() => null}
      className={`bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent! ${!props.disabled && "hover:from-indigo-400 hover:to-fuchsia-400 hover:[&>svg]:fill-indigo-400"}`}
      outline
    >
      <SparklesIcon className="fill-indigo-500" />
      Suggest actions
    </Button>
  );
}
