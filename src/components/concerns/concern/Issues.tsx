//import { Dispatch, SetStateAction } from "react";
//import { toast } from "sonner";
import IssuesData from "@/data/issues.json";
//import { updateIssues } from "@/app/(protected)/concerns/[id]/actions";
import { BadgeButton, Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";

type IssuesProps = {
  //concernID: number;
  val: number[];
  //setVal: Dispatch<SetStateAction<number[]>>;
  //disabled: boolean;
  //setDisabled: Dispatch<SetStateAction<boolean>>;
};

export default function Issues(props: IssuesProps) {
  return (
    <>
      {props.val.length ? (
        <div className="mt-5 flex flex-wrap gap-4 sm:gap-3">
          {props.val.map((issue) => (
            <Badge key={issue}>{IssuesData.find((i) => i.id === issue)?.tag}</Badge>
          ))}
        </div>
      ) : (
        <Text className="mt-3">No issues selected</Text>
      )}
    </>
  );

  /* const issueClick = async (id: number) => {
    const newVal = props.val.includes(id) ? props.val.filter((i) => i !== id) : [...props.val, id];
    props.setVal(newVal);
    props.setDisabled(true);
    const result = await updateIssues(Number(props.concernID), newVal);
    props.setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Issues updated"); // Success
  }; */

  /*return (
    <div className={`mt-5 flex flex-wrap gap-4 sm:gap-3 ${props.disabled && "opacity-50"}`}>
      {IssuesData.map((issue) => (
        <BadgeButton
          key={issue.id}
          onClick={() => issueClick(issue.id)}
          color={props.val.includes(issue.id) ? "indigo" : "zinc"}
          disabled={props.disabled}
        >
          {issue.tag}
        </BadgeButton>
      ))}
    </div>
  );*/
}
