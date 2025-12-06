"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserGroupIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Textarea } from "@/components/textarea";
import { Description, Field, Fieldset } from "@/components/fieldset";
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
          <Description>Add the email addresses or mobile numbers of your staff.</Description>

          <Textarea
            rows={15}
            placeholder={`Separate by comma or line break, e.g.
alice@company.com.au
bob.smith@company.com.au
+61 412 345 678
charlie@company.com.au, dave@company.com.au`}
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
