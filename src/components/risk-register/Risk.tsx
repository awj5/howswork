import { Dispatch, SetStateAction } from "react";
import { DateTime } from "luxon";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import IssuesData from "@/data/issues.json";
import type { RiskType } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/ui/dropdown";

type RiskProps = {
  data: RiskType;
  timezone: string;
  setRiskDialogOpen: Dispatch<SetStateAction<boolean>>;
  setEditID: Dispatch<SetStateAction<number>>;
  disabled: boolean;
  setAlertOpen: Dispatch<SetStateAction<boolean>>;
  setDeleteID: Dispatch<SetStateAction<number>>;
};

export default function Risk(props: RiskProps) {
  const dateRaised = DateTime.fromISO(props.data.date_raised); // Convert to date object
  const dateReviewed = props.data.date_reviewed ? DateTime.fromISO(props.data.date_reviewed) : undefined; // Convert to date object

  const editClick = () => {
    props.setEditID(props.data.id!);
    props.setRiskDialogOpen(true);
  };

  const deleteClick = () => {
    props.setDeleteID(props.data.id!);
    props.setAlertOpen(true);
  };

  return (
    <TableRow>
      <TableCell className="align-top font-medium">
        {dateRaised.setZone(props.timezone).toFormat("dd LLL yyyy")}
      </TableCell>

      <TableCell className="align-top"></TableCell>

      <TableCell className="align-top">
        {props.data.issues?.length ? (
          <div className="flex min-w-3xs flex-wrap gap-3">
            {props.data.issues.map((issue) => {
              const tag = IssuesData.find((i) => i.id === issue)?.tag;

              return <Badge key={issue}>{tag}</Badge>;
            })}
          </div>
        ) : (
          <Text>—</Text>
        )}
      </TableCell>

      <TableCell className="align-top">
        <Text className="min-w-3xs whitespace-pre-line">{props.data.description}</Text>
      </TableCell>

      <TableCell className="align-top">
        <Badge color={props.data.level === 1 ? "yellow" : props.data.level === 2 ? "orange" : "red"}>
          {props.data.level === 1 ? "Low" : props.data.level === 2 ? "Medium" : "High"}
        </Badge>
      </TableCell>

      <TableCell className="align-top">
        {dateReviewed ? dateReviewed.setZone(props.timezone).toFormat("dd LLL yyyy") : <Text>—</Text>}
      </TableCell>

      <TableCell className="align-top">
        <Badge
          color={
            props.data.status === 1
              ? "blue"
              : props.data.status === 2
                ? "orange"
                : props.data.status === 3
                  ? "yellow"
                  : "green"
          }
        >
          {props.data.status === 1
            ? "Open"
            : props.data.status === 2
              ? "Under review"
              : props.data.status === 3
                ? "Action planned"
                : "Resolved"}
        </Badge>
      </TableCell>

      <TableCell className="align-top"></TableCell>

      <TableCell className="align-top">
        <div className="-mx-3 -my-1.5 sm:-mx-2.5">
          <Dropdown>
            <DropdownButton plain aria-label="More options">
              <EllipsisHorizontalIcon />
            </DropdownButton>

            <DropdownMenu anchor="bottom end">
              <DropdownItem onClick={editClick} disabled={props.disabled}>
                Edit
              </DropdownItem>

              <DropdownItem
                onClick={deleteClick}
                disabled={props.disabled || !!props.data.concern_id || !!props.data.check_in_id}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </TableCell>
    </TableRow>
  );
}
