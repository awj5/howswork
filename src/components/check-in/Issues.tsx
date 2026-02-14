import { CheckInIssueType } from "@/types";
import IssuesData from "@/data/issues.json";
import AttributionsData from "@/data/attributions.json";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Subheading } from "@/components/ui/heading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type IssuesProps = {
  data: CheckInIssueType[] | undefined;
  status: number;
};

export default function Issues(props: IssuesProps) {
  return (
    <div className="mt-12">
      <Subheading>Issues experienced ({props.data?.length})</Subheading>

      <div className="mt-4">
        {props.data?.length ? (
          <Table className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]" dense>
            <TableHead>
              <TableRow>
                <TableHeader>Issue</TableHeader>
                <TableHeader>Employees</TableHeader>
                <TableHeader>Attributed to</TableHeader>
              </TableRow>
            </TableHead>

            <TableBody>
              {props.data.map((issue) => {
                const name = IssuesData.find((i) => i.id === issue.id)?.name;

                return (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>{issue.count}</TableCell>

                    <TableCell className="space-x-3">
                      {issue.attributions.length ? (
                        issue.attributions.map((attribution) => {
                          const label = AttributionsData.find((i) => i.id === attribution.id)?.label;

                          return (
                            <Badge key={attribution.id}>
                              {label}
                              {attribution.count > 1 && ` (${attribution.count})`}
                            </Badge>
                          );
                        })
                      ) : (
                        <Text>—</Text>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Text>{props.status !== 1 ? "No issues reported" : "N/A"}</Text>
        )}
      </div>
    </div>
  );
}
