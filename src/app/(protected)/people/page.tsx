"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserGroupIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Textarea } from "@/components/textarea";
import { Description, Field, Fieldset, Label } from "@/components/fieldset";
import { Text } from "@/components/text";

export default function People() {
  const router = useRouter();
  const [disabled, setDisabled] = useState(true);

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    //
  };

  useEffect(() => {
    setDisabled(false);
  }, []);

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
          <Description>Add the email addresses or mobile numbers of your staff.</Description>

          <Textarea
            rows={15}
            placeholder={`Add one per line or separate with commas, e.g.
jane@company.com.au
john.doe@company.com.au
+61 412 345 678
alice@company.com.au, bob@company.com.au`}
          />
        </Field>

        <div className="mt-8 flex items-start justify-between gap-10">
          <Text>0 members</Text>

          <Button type="submit" color="indigo" disabled={disabled}>
            Save changes
          </Button>
        </div>
      </Fieldset>
    </form>
  );
}
