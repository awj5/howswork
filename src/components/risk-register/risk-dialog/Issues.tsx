"use client";

import { Dispatch, SetStateAction } from "react";
import IssuesData from "@/data/issues.json";
import { BadgeButton } from "@/components/ui/badge";
import { Field, Label } from "@/components/ui/fieldset";

type IssuesProps = {
  val: number[];
  setVal: Dispatch<SetStateAction<number[]>>;
  disabled: boolean;
};

export default function Issues(props: IssuesProps) {
  return (
    <Field disabled={props.disabled}>
      <Label>Issues</Label>

      <div className={`mt-4 flex flex-wrap gap-4 sm:gap-3 ${props.disabled && "opacity-50"}`}>
        {IssuesData.map((issue) => (
          <BadgeButton
            key={issue.id}
            color={props.val?.includes(issue.id) ? "indigo" : "zinc"}
            onClick={() =>
              props.setVal((prev) =>
                prev.includes(issue.id) ? prev.filter((i) => i !== issue.id) : [...prev, issue.id]
              )
            }
          >
            {issue.tag}
          </BadgeButton>
        ))}
      </div>
    </Field>
  );
}
