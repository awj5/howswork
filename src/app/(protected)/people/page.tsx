"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserGroupIcon } from "@heroicons/react/16/solid";
import PlansData from "@/data/plans.json";
import { useCompanies } from "@/hooks/useCompanies";
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning";
import { createClient } from "@/utils/supabase/client";
import { isValidEmail, isValidPhone } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Textarea } from "@/components/ui/textarea";
import { Description, ErrorMessage, Field, Fieldset, Label } from "@/components/ui/fieldset";
import { Strong, Text, TextLink } from "@/components/ui/text";
import HelperTooltip from "@/components/HelperTooltip";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";
import { updateStaff } from "./actions";

export default function People() {
  const companies = useCompanies();
  const [savedStaff, setSavedStaff] = useState("");
  const [staff, setStaff] = useState("");
  const [staffError, setStaffError] = useState<React.ReactNode>();
  const [disabled, setDisabled] = useState(true);
  const members = parseContacts(staff).length;

  useUnsavedWarning([[staff, savedStaff]]);

  const submitForm = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!companies.length) return;
    setStaffError(undefined);
    const contacts = parseContacts(staff);

    // Validate
    if (contacts.length && contacts.length < 3) {
      setStaffError("Add at least 3 staff contacts. This helps protect anonymity.");
      return;
    }

    const invalidContacts = contacts.filter((i) => !isValidContact(i));

    if (invalidContacts.length) {
      setStaffError("One or more contacts are invalid. Please check and try again.");
      return;
    }

    // Check if contacts within plan limit (exclude enterprise)
    const plan = PlansData.find((i) => i.id === companies[0].plan);

    if (contacts.length && plan && !plan.unlimited && contacts.length > plan.limit) {
      setStaffError(
        <>
          Your plan supports up to {plan.limit} staff contacts. Remove some or{" "}
          <TextLink href="/settings">upgrade</TextLink> to add more.
        </>
      );
      return;
    }

    // Update
    setDisabled(true);
    const result = await updateStaff(companies[0].id, contacts);
    setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success("Changes saved");
    setSavedStaff(staff);
  };

  useEffect(() => {
    if (!companies.length) return;

    const getStaff = async () => {
      const supabase = createClient();

      const { data: peopleData, error: peopleError } = await supabase
        .from("people")
        .select("contacts")
        .eq("company_id", companies[0].id)
        .single();

      if (peopleError) {
        console.error(peopleError);
        return;
      }

      const contacts = peopleData.contacts ?? [];
      const text = contacts.join("\n"); // One contact per line
      setStaff(text);
      setSavedStaff(text);
      setDisabled(false);
    };

    getStaff();
  }, [companies]);

  return (
    <form onSubmit={submitForm} className="mx-auto max-w-4xl">
      <div className="flex h-12 items-end justify-between gap-4 sm:h-10">
        <div className="flex items-center gap-4">
          <Heading>People</Heading>

          {staff !== savedStaff && (
            <Badge color="amber" className="fade-in max-sm:hidden">
              Unsaved changes
            </Badge>
          )}
        </div>

        <Button href="/people/teams" outline>
          <UserGroupIcon />
          Manage teams
        </Button>
      </div>

      <Divider className="mt-6 mb-10" />

      <Fieldset className="mt-8" disabled={disabled}>
        <Field>
          <Label>Staff Contacts</Label>

          <div data-slot="description" className="flex items-center gap-1.5">
            <Description>
              Enter one contact per employee (email or mobile, <Strong>not both</Strong>). Separate by comma or line
              break.
            </Description>

            <HelperTooltip text="Group email addresses (e.g. team@company.com) count as one staff contact." />
          </div>

          <Textarea
            rows={12}
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
            placeholder={`name@company.com
anothername@company.com
+61 4XX XXX XXX`}
            invalid={!!staffError}
          />

          {staffError && <ErrorMessage>{staffError}</ErrorMessage>}
        </Field>

        <div className="mt-8 flex items-start justify-between gap-10">
          <Text>{`${members} member${!members || members > 1 ? "s" : ""}`}</Text>

          <div className="flex gap-4">
            <Button type="button" onClick={() => setStaff("")} plain disabled={disabled} className="hidden! sm:inline!">
              Clear
            </Button>

            <Button type="submit" color="indigo" disabled={disabled || staff === savedStaff}>
              Save changes
            </Button>
          </div>
        </div>
      </Fieldset>
    </form>
  );
}

function parseContacts(val: string) {
  return Array.from(
    new Set(
      val
        .split(/[\n,]/) // split on commas OR line breaks
        .map((c) => c.trim())
        .filter(Boolean)
    )
  );
}

function isValidContact(val: string) {
  return isValidEmail(val) || isValidPhone(val);
}
