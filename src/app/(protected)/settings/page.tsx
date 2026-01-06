"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TrashIcon } from "@heroicons/react/16/solid";
import { AU, CA, IE, NZ, GB, US } from "country-flag-icons/react/3x2";
import { useCompanies } from "@/hooks/useCompanies";
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning";
import { Heading, Subheading } from "@/components/ui/heading";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Text, TextLink } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import { ErrorMessage, Field, Fieldset } from "@/components/ui/fieldset";
import { Button } from "@/components/ui/button";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/ui/listbox";
import { deleteCompany, updateCompany } from "./actions";

type FormErrorsType = {
  name?: boolean;
  slug?: boolean;
};

export default function Settings() {
  const companies = useCompanies();
  const nameRef = useRef("");
  const slugRef = useRef("");
  const timezoneRef = useRef("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [timezone, setTimezone] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrorsType>({});
  const [alertOpen, setAlertOpen] = useState(false);

  const timezonesByCountry = {
    AU: [
      "Australia/Sydney",
      "Australia/Melbourne",
      "Australia/Brisbane",
      "Australia/Adelaide",
      "Australia/Perth",
      "Australia/Hobart",
      "Australia/Darwin",
    ],
    NZ: ["Pacific/Auckland", "Pacific/Chatham"],
    GB: ["Europe/London"],
    IE: ["Europe/Dublin"],
    CA: [
      "America/Vancouver",
      "America/Edmonton",
      "America/Winnipeg",
      "America/Toronto",
      "America/Halifax",
      "America/St_Johns",
    ],
    US: [
      "America/Los_Angeles",
      "America/Denver",
      "America/Chicago",
      "America/New_York",
      "America/Anchorage",
      "Pacific/Honolulu",
    ],
  };

  const timezones = Object.entries(timezonesByCountry).flatMap(([code, zones]) =>
    zones.map((z) => ({
      value: z,
      name: z.replace("_", " "),
      code: code.toLowerCase(),
    }))
  );

  const flagMap: Record<string, React.ComponentType<any>> = {
    au: AU,
    ca: CA,
    ie: IE,
    nz: NZ,
    gb: GB,
    us: US,
  };

  useUnsavedWarning([
    [name, nameRef.current],
    [slug, slugRef.current],
    [timezone, timezoneRef.current],
  ]);

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const errors: FormErrorsType = {};
    if (!name.trim()) errors.name = true;
    if (!slugRegex.test(slug)) errors.slug = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    // Update
    setDisabled(true);
    const result = await updateCompany({ id: companies[0].id, name, slug, timezone });
    setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success("Changes saved!");
    nameRef.current = name;
    slugRef.current = slug;
    timezoneRef.current = timezone;
  };

  const deleteCompanyClick = async () => {
    setDisabled(true);
    setAlertOpen(false); // Close
    const result = await deleteCompany(companies[0].id);

    if (result.error) {
      toast.error(result.error);
      setDisabled(false);
      return;
    }

    // Success (clear and keep disabled)
    setName("");
    setSlug("");
    setTimezone("");
    nameRef.current = "";
    slugRef.current = "";
    timezoneRef.current = "";
  };

  useEffect(() => {
    if (!companies.length) return;
    setName(companies[0].name);
    nameRef.current = companies[0].name;
    setSlug(companies[0].slug);
    slugRef.current = companies[0].slug;
    setTimezone(companies[0].timezone);
    timezoneRef.current = companies[0].timezone;
    setDisabled(false);
  }, [companies]);

  return (
    <form onSubmit={submitForm} className="mx-auto max-w-4xl">
      <div className="flex h-12 items-end sm:h-10">
        <Heading>Settings</Heading>
      </div>

      <Divider className="mt-6 mb-10" />

      <Fieldset disabled={disabled}>
        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Subheading>Company Name</Subheading>
            <Text>This name will appear to everyone in your organisation.</Text>
          </div>

          <Field>
            <Input
              aria-label="Company Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              invalid={formErrors.name}
            />

            {formErrors.name && <ErrorMessage>This field is required.</ErrorMessage>}
          </Field>
        </section>

        <Divider className="my-10" soft />

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Subheading>Company URL</Subheading>

            <Text>
              This is your company's unique URL:
              <br />
              <TextLink href={`https://howswork.app/${slug}`} target="_blank">
                {`https://howswork.app/${slug}`}
              </TextLink>
            </Text>
          </div>

          <Field>
            <Input
              aria-label="Company URL"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              invalid={formErrors.slug}
            />

            {formErrors.slug && <ErrorMessage>Use only lowercase letters, numbers, and hyphens.</ErrorMessage>}
          </Field>
        </section>

        <Divider className="my-10" soft />

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Subheading>Timezone</Subheading>
            <Text>Used for language settings and scheduling check-ins in your local time.</Text>
          </div>

          <Field>
            <Listbox value={timezone} onChange={(e) => setTimezone(e)}>
              {timezones.map((t) => {
                const Flag = flagMap[t.code];

                return (
                  <ListboxOption key={t.value} value={t.value}>
                    <Flag className="w-5 sm:w-4" />
                    <ListboxLabel>{t.name}</ListboxLabel>
                  </ListboxOption>
                );
              })}
            </Listbox>
          </Field>
        </section>

        <Divider className="my-10" soft />

        <div className="flex flex-col-reverse items-end justify-between gap-10 sm:flex-row">
          <Button type="button" onClick={() => setAlertOpen(true)} outline>
            <TrashIcon />
            Delete this company
          </Button>

          <Button type="submit" color="indigo">
            Save changes
          </Button>
        </div>
      </Fieldset>

      <Alert open={alertOpen} onClose={setAlertOpen}>
        <AlertTitle>Are you sure you want to delete {companies[0]?.name.replace(/\.$/, "")}?</AlertTitle>

        <AlertDescription>
          This action cannot be undone. The company and all associated records will be permanently deleted.
        </AlertDescription>

        <AlertActions>
          <Button plain onClick={() => setAlertOpen(false)}>
            Cancel
          </Button>

          <Button onClick={deleteCompanyClick} color="red">
            Delete
          </Button>
        </AlertActions>
      </Alert>
    </form>
  );
}
