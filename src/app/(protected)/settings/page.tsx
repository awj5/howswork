"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TrashIcon } from "@heroicons/react/16/solid";
import { AU, CA, IE, NZ, GB, US } from "country-flag-icons/react/3x2";
import { useCompanies } from "@/hooks/useCompanies";
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning";
import { Heading, Subheading } from "@/components/heading";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/alert";
import { Text, TextLink } from "@/components/text";
import { Divider } from "@/components/divider";
import { Input } from "@/components/input";
import { ErrorMessage, Field, Fieldset } from "@/components/fieldset";
import { Button } from "@/components/button";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/listbox";
import { deleteCompany, updateCompany } from "./actions";

type FormErrorsType = {
  name?: boolean;
  slug?: boolean;
};

export default function Settings() {
  const companies = useCompanies();
  const nameRef = useRef("");
  const slugRef = useRef("");
  const countryRef = useRef("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [country, setCountry] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrorsType>({});
  const [alertOpen, setAlertOpen] = useState(false);

  const countries = [
    { name: "Australia", code: "au" },
    { name: "Canada", code: "ca" },
    { name: "Ireland", code: "ie" },
    { name: "New Zealand", code: "nz" },
    { name: "United Kingdom", code: "gb" },
    { name: "United States", code: "us" },
  ];

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
    [country, countryRef.current],
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
    const result = await updateCompany({ id: companies[0].id, name, slug, country });
    setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success("Changes saved!");
    nameRef.current = name;
    slugRef.current = slug;
    countryRef.current = country;
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
    setCountry("");
    nameRef.current = "";
    slugRef.current = "";
    countryRef.current = "";
  };

  useEffect(() => {
    if (!companies.length) return;
    setName(companies[0].name);
    nameRef.current = companies[0].name;
    setSlug(companies[0].slug);
    slugRef.current = companies[0].slug;
    setCountry(companies[0].country);
    countryRef.current = companies[0].country;
    setDisabled(false);
  }, [companies]);

  return (
    <form onSubmit={submitForm} className="mx-auto max-w-4xl">
      <Heading>Settings</Heading>
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
              name="name"
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
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              invalid={formErrors.slug}
            />

            {formErrors.slug && (
              <ErrorMessage>Field can only contain lowercase letters, numbers, and hyphens.</ErrorMessage>
            )}
          </Field>
        </section>

        <Divider className="my-10" soft />

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Subheading>Country</Subheading>
            <Text>Used to set language and your country's phone code.</Text>
          </div>

          <Field>
            <Listbox name="country" value={country} onChange={(e) => setCountry(e)}>
              {countries.map((c) => {
                const Flag = flagMap[c.code];

                return (
                  <ListboxOption key={c.code} value={c.code}>
                    <Flag className="w-5 sm:w-4" />
                    <ListboxLabel>{c.name}</ListboxLabel>
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
            Delete company
          </Button>

          <Button type="submit" color="indigo">
            Save changes
          </Button>
        </div>
      </Fieldset>

      <Alert open={alertOpen} onClose={setAlertOpen}>
        <AlertTitle>Are you sure you want to delete your company?</AlertTitle>
        <AlertDescription>This action cannot be undone. Your company will be permanently deleted.</AlertDescription>

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
