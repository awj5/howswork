import { Dispatch, SetStateAction, useState } from "react";
import { DateTime } from "luxon";
import { EllipsisHorizontalIcon, SparklesIcon } from "@heroicons/react/16/solid";
import IssuesData from "@/data/issues.json";
import StatusData from "@/data/status.json";
import type { RiskType } from "@/types";
import { concernStatusColor } from "@/utils/helpers";
import { TableCell, TableRow } from "@/components/ui/table";
import { Text, TextLink } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/ui/dropdown";
import SuggestActions from "@/components/SuggestActions";

type RiskProps = {
  data: RiskType;
  timezone: string;
  setRiskDialogOpen: Dispatch<SetStateAction<boolean>>;
  setEditID: Dispatch<SetStateAction<number>>;
  disabled: boolean;
  setDisabled: Dispatch<SetStateAction<boolean>>;
  setAlertOpen: Dispatch<SetStateAction<boolean>>;
  setDeleteID: Dispatch<SetStateAction<number>>;
};

export default function Risk(props: RiskProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [responseExpanded, setResponseExpanded] = useState(false);
  const textLimit = 280;
  const longDescription = props.data.description.length > textLimit;
  const longResponse = props.data.response && props.data.response.length > textLimit;

  // Convert to date object
  const dateRaised = DateTime.fromISO(props.data.date_raised);
  const dateReviewed = props.data.date_reviewed ? DateTime.fromISO(props.data.date_reviewed) : undefined;
  const dateResolved = props.data.date_resolved ? DateTime.fromISO(props.data.date_resolved) : undefined;
  const checkInDate = props.data.check_in_date ? DateTime.fromISO(props.data.check_in_date) : undefined;

  const editClick = () => {
    props.setEditID(props.data.id!);
    props.setRiskDialogOpen(true);
  };

  const deleteClick = () => {
    props.setDeleteID(props.data.id!);
    props.setAlertOpen(true);
  };

  return (
    <TableRow className="[&>td]:align-top">
      <TableCell>
        {dateRaised.toLocal().toLocaleString({ day: "numeric", month: "numeric", year: "2-digit" })}
      </TableCell>

      <TableCell>
        <Badge color={props.data.level === 1 ? "yellow" : props.data.level === 2 ? "orange" : "red"}>
          {props.data.level === 1 ? "Low" : props.data.level === 2 ? "Medium" : "High"}
        </Badge>
      </TableCell>

      <TableCell>
        {props.data.concern_id ? (
          <TextLink href={`/concerns/${props.data.concern_id}`}>HW-{props.data.concern_tracking}</TextLink>
        ) : checkInDate ? (
          <TextLink href={`/check-ins/${props.data.check_in_id}`}>
            Check-in{" "}
            {checkInDate.setZone(props.timezone).toLocaleString({ day: "numeric", month: "numeric", year: "2-digit" })}
          </TextLink>
        ) : (
          "Manual"
        )}
      </TableCell>

      <TableCell>
        {props.data.issues?.length ? (
          <div className="inline-flex min-w-3xs flex-wrap gap-3">
            {props.data.issues.map((issue) => {
              const tag = IssuesData.find((i) => i.id === issue)?.tag;
              return <Badge key={issue}>{tag}</Badge>;
            })}
          </div>
        ) : (
          <Text>—</Text>
        )}
      </TableCell>

      <TableCell>
        <Text className="min-w-2xs whitespace-pre-line">
          {descriptionExpanded || !longDescription ? (
            <>
              {props.data.description}
              {longDescription && (
                <>
                  {" "}
                  <TextLink
                    href=""
                    onClick={(e) => {
                      e.preventDefault();
                      setDescriptionExpanded(false);
                    }}
                  >
                    Less
                  </TextLink>
                </>
              )}
            </>
          ) : (
            <>
              {props.data.description.slice(0, textLimit).trim()}
              {"… "}
              <TextLink
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  setDescriptionExpanded(true);
                }}
              >
                More
              </TextLink>
            </>
          )}
        </Text>

        {props.data.ai_description && <AILabel />}
      </TableCell>

      <TableCell>
        <Badge color={concernStatusColor(props.data.status)}>
          {StatusData.find((i) => i.id === props.data.status)?.title.replace("New response", "Awaiting review")}
        </Badge>
      </TableCell>

      <TableCell>
        {dateReviewed ? (
          dateReviewed.toLocal().toLocaleString({ day: "numeric", month: "numeric", year: "2-digit" })
        ) : (
          <Text>—</Text>
        )}
      </TableCell>

      <TableCell>
        {props.data.response ? (
          <>
            <Text className="min-w-2xs whitespace-pre-line">
              {responseExpanded || !longResponse ? (
                <>
                  {props.data.response}
                  {longResponse && (
                    <>
                      {" "}
                      <TextLink
                        href=""
                        onClick={(e) => {
                          e.preventDefault();
                          setResponseExpanded(false);
                        }}
                      >
                        Less
                      </TextLink>
                    </>
                  )}
                </>
              ) : (
                <>
                  {props.data.response.slice(0, textLimit).trim()}
                  {"… "}
                  <TextLink
                    href=""
                    onClick={(e) => {
                      e.preventDefault();
                      setResponseExpanded(true);
                    }}
                  >
                    More
                  </TextLink>
                </>
              )}
            </Text>

            {props.data.ai_response && <AILabel />}
          </>
        ) : (
          <SuggestActions riskID={props.data.id!} disabled={props.disabled} setDisabled={props.setDisabled} />
        )}
      </TableCell>

      <TableCell>
        {dateResolved ? (
          dateResolved.toLocal().toLocaleString({ day: "numeric", month: "numeric", year: "2-digit" })
        ) : (
          <Text>—</Text>
        )}
      </TableCell>

      <TableCell>{props.data.owner ? props.data.owner : <Text>—</Text>}</TableCell>

      <TableCell>
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

function AILabel() {
  return (
    <span className="gradient-text pointer-events-none mt-3 inline-flex items-center gap-1.5 text-sm sm:text-xs">
      <SparklesIcon className="size-5 fill-indigo-500 sm:size-4" /> Auto-generated
    </span>
  );
}
