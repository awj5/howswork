import { CheckInIssueType } from "@/types";
import IssuesData from "@/data/issues.json";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Subheading } from "@/components/ui/heading";
import { Divider } from "@/components/ui/divider";

type IssuesProps = {
  data: CheckInIssueType[] | undefined;
  status: number;
};

export default function Issues(props: IssuesProps) {
  return (
    <div>
      <Subheading>Issues experienced</Subheading>
      <Divider className="mt-4" />

      <div className="mt-5 flex flex-wrap gap-4 sm:gap-3">
        {props.data?.length ? (
          props.data.map((issue) => {
            const tag = IssuesData.find((i) => i.id === issue.id)?.tag;

            return (
              <Badge key={issue.id} color="indigo">
                {tag} ({issue.count})
              </Badge>
            );
          })
        ) : (
          <Text>{props.status > 2 ? "No issues reported" : "N/A"}</Text>
        )}
      </div>
    </div>
  );
}
