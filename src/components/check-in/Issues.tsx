import { CheckInIssueType } from "@/types";
import IssuesData from "@/data/issues.json";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";

type IssuesProps = {
  data: CheckInIssueType[] | undefined;
};

export default function Issues(props: IssuesProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-4 sm:gap-3">
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
        <Text>No issues reported</Text>
      )}
    </div>
  );
}
