import { DateTime } from "luxon";
import IssuesData from "@/data/issues.json";
import type { RiskType } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";

type RiskProps = {
  data: RiskType;
  timezone: string;
};

export default function Risk(props: RiskProps) {
  const dateRaised = DateTime.fromISO(props.data.date_raised); // Convert to date object
  const dateReviewed = DateTime.fromISO(props.data.date_reviewed); // Convert to date object

  return (
    <TableRow>
      <TableCell className="align-top font-medium">
        {dateRaised.setZone(props.timezone).toFormat("dd LLL yyyy")}
      </TableCell>

      <TableCell className="align-top">
        {props.data.issues?.length ? (
          <div className="flex min-w-3xs flex-wrap gap-3">
            {props.data.issues.map((issue) => {
              const tag = IssuesData.find((i) => i.id === issue)?.tag;

              return (
                <Badge key={issue} color="indigo">
                  {tag}
                </Badge>
              );
            })}
          </div>
        ) : (
          <Text>—</Text>
        )}
      </TableCell>

      <TableCell className="align-top">
        <Text className="min-w-3xs whitespace-pre-line">{props.data.description}</Text>
      </TableCell>

      <TableCell className="align-top"></TableCell>
      <TableCell className="align-top">{dateReviewed.setZone(props.timezone).toFormat("dd LLL yyyy")}</TableCell>
      <TableCell className="align-top"></TableCell>
      <TableCell className="align-top"></TableCell>
    </TableRow>
  );
}
