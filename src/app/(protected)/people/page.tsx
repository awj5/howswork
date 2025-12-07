"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserGroupIcon } from "@heroicons/react/16/solid";
import { useCompanies } from "@/hooks/useCompanies";
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Textarea } from "@/components/textarea";
import { Description, Field, Fieldset, Label } from "@/components/fieldset";
import { Text } from "@/components/text";

export default function People() {
  const supabase = createClient();
  const router = useRouter();
  const companies = useCompanies();
  const staffRef = useRef("");
  const [staff, setStaff] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [members, setMembers] = useState(0);

  useUnsavedWarning([[staff, staffRef.current]]);

  const changeStaff = (val: string) => {
    setStaff(val);
    const contacts = parseContacts(val);
    setMembers(contacts.length);
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    //
  };

  useEffect(() => {
    if (!companies.length) return;

    const getStaff = async () => {
      const { data: staffContactsData, error: staffContactsError } = await supabase
        .from("staff_contacts")
        .select("contacts")
        .eq("company_id", companies[0].id)
        .single();

      if (staffContactsError) {
        console.error(staffContactsError);
        return;
      }

      const contacts = staffContactsData.contacts ?? [];
      const text = contacts.join("\n"); // One per line
      setStaff(text);
      staffRef.current = text;
      setMembers(contacts.length);
      setDisabled(false);
    };

    getStaff();
  }, [companies]);

  return (
    <form onSubmit={submitForm} className="mx-auto max-w-4xl">
      <div className="flex items-end justify-between gap-4">
        <Heading>People</Heading>

        <Button onClick={() => router.push("/people/admins")} outline>
          <UserGroupIcon />
          Manage admins
        </Button>
      </div>

      <Fieldset className="mt-8" disabled={disabled}>
        <Field>
          <Label>Email addresses or mobile numbers</Label>

          <Description>
            Add your staff's email addresses or mobile numbers, separated by commas or line breaks.
          </Description>

          <Textarea
            rows={15}
            value={staff}
            onChange={(e) => changeStaff(e.target.value)}
            placeholder={`jane@company.com
john.doe@company.com
+61 412 345 678
alice@company.com, bob@company.com`}
          />
        </Field>

        <div className="mt-8 flex items-start justify-between gap-10">
          <Text>{members} members</Text>

          <Button type="submit" color="indigo" disabled={disabled}>
            Save changes
          </Button>
        </div>
      </Fieldset>
    </form>
  );
}

const parseContacts = (input: string) => {
  return Array.from(
    new Set(
      input
        .split(/[\n,]/) // split on commas OR line breaks
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
};
