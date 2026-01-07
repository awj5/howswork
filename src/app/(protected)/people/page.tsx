"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserGroupIcon } from "@heroicons/react/16/solid";
import { useCompanies } from "@/hooks/useCompanies";
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning";
import { createClient } from "@/utils/supabase/client";
import { isValidEmail, isValidPhone } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Textarea } from "@/components/ui/textarea";
import { Description, ErrorMessage, Field, Fieldset, Label } from "@/components/ui/fieldset";
import { Text } from "@/components/ui/text";
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
              Enter one contact per employee (email OR mobile, not both). Separate by comma or line break.
            </Description>

            <HelperTooltip text="Group email addresses (e.g. team@company.com) work well for larger organisations." />
          </div>

          <Textarea
            rows={15}
            value={staff}
            onChange={(e) => changeStaff(e.target.value)}
            placeholder={`name@company.com
anothername@company.com
+61 4XX XXX XXX`}
            invalid={staffError}
          />

          {staffError && <ErrorMessage>One or more contacts are invalid. Please check and try again.</ErrorMessage>}
        </Field>

        <div className="mt-8 flex items-start justify-between gap-10">
          <Text>{`${members} member${!members || members > 1 ? "s" : ""}`}</Text>

          <div className="flex gap-4">
            <Button type="button" onClick={() => setStaff("")} plain disabled={disabled} className="hidden! sm:inline!">
              Clear
            </Button>

            <Button type="submit" color="indigo" disabled={disabled}>
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
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

function isValidContact(val: string) {
  return isValidEmail(val) || isValidPhone(val);
}
