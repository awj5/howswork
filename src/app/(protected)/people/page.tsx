"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserGroupIcon } from "@heroicons/react/16/solid";
import { useCompanies } from "@/hooks/useCompanies";
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning";
import { createClient } from "@/utils/supabase/client";
import { isValidEmail, isValidPhone } from "@/utils/helpers";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Textarea } from "@/components/textarea";
import { Description, ErrorMessage, Field, Fieldset, Label } from "@/components/fieldset";
import { Strong, Text } from "@/components/text";
import HelperTooltip from "@/components/HelperTooltip";
import { updateStaff } from "./actions";

export default function People() {
  const supabase = createClient();
  const router = useRouter();
  const companies = useCompanies();
  const staffRef = useRef("");
  const [staff, setStaff] = useState("");
  const [staffError, setStaffError] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [members, setMembers] = useState(0);

  useUnsavedWarning([[staff, staffRef.current]]);

  const changeStaff = (val: string) => {
    setStaff(val);
    const contacts = parseContacts(val);
    setMembers(contacts.length);
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStaffError(false);
    const contacts = parseContacts(staff);

    // Validate
    const invalidContacts = contacts.filter((c) => !isValidContact(c));

    if (invalidContacts.length) {
      setStaffError(true);
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
    toast.success("Changes saved!");
    staffRef.current = staff;
  };

  useEffect(() => {
    if (!companies.length) return;

    const getStaff = async () => {
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
      staffRef.current = text;
      setMembers(contacts.length);
      setDisabled(false);
    };

    getStaff();
  }, [companies]);

  return (
    <form onSubmit={submitForm} className="mx-auto max-w-4xl">
      <div className="flex h-12 items-end justify-between gap-4 sm:h-10">
        <Heading>People</Heading>

        <Button onClick={() => router.push("/people/admins")} outline>
          <UserGroupIcon />
          Manage admins
        </Button>
      </div>

      <Fieldset className="mt-8" disabled={disabled}>
        <Field>
          <Label>Staff Contacts</Label>

          <div data-slot="description" className="flex items-center gap-1.5">
            <Description>
              Enter one email <Strong>OR</Strong> mobile number per staff member. Separate by comma or line break.
            </Description>

            <HelperTooltip text="Group email addresses (like team@company.com) are recommended for larger organisations" />
          </div>

          <Textarea
            rows={15}
            value={staff}
            onChange={(e) => changeStaff(e.target.value)}
            placeholder={`jane@company.com
john.doe@company.com
+61 412 345 678
alice@company.com, bob@company.com`}
            invalid={staffError}
          />

          {staffError && <ErrorMessage>Some email addresses or mobile numbers are invalid.</ErrorMessage>}
        </Field>

        <div className="mt-8 flex items-start justify-between gap-10">
          <Text>{`${members} member${!members || members > 1 ? "s" : ""}`}</Text>

          <Button type="submit" color="indigo" disabled={disabled}>
            Save changes
          </Button>
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
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

function isValidContact(val: string) {
  return isValidEmail(val) || isValidPhone(val);
}
