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
  const dateReviewed = DateTime.fromISO(props.data.date_reviewed); // Convert to date object

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
