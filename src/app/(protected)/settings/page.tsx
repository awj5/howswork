"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TrashIcon, UserGroupIcon, CreditCardIcon, BoltIcon, ArrowsRightLeftIcon } from "@heroicons/react/16/solid";
import { GlobeAltIcon } from "@heroicons/react/20/solid";
import { AU, CA, IE, NZ, GB, US, SG, HK, ZA } from "country-flag-icons/react/3x2";
import PlansData from "@/data/plans.json";
import { pricingURL } from "@/utils/helpers";
import { useCompanies } from "@/hooks/useCompanies";
import { useUnsavedWarning } from "@/hooks/useUnsavedWarning";
import { Heading, Subheading } from "@/components/ui/heading";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Strong, Text, TextLink } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import { ErrorMessage, Field, Fieldset } from "@/components/ui/fieldset";
import { Button } from "@/components/ui/button";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/ui/listbox";
import { Badge } from "@/components/ui/badge";
import { deleteCompany, updateCompany, openStripe } from "./actions";

type FormErrorsType = {
  name?: boolean;
  slug?: boolean;
};

export default function Settings() {
  const companies = useCompanies();
  const [savedName, setSavedName] = useState("");
  const [savedSlug, setSavedSlug] = useState("");
  const [savedTimezone, setSavedTimezone] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [timezone, setTimezone] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrorsType>({});
  const [alertOpen, setAlertOpen] = useState(false);
  const plan = companies.length ? PlansData.find((i) => i.id === companies[0].plan) : undefined;

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
    NZ: ["Pacific/Auckland"],
    GB: ["Europe/London"],
    IE: ["Europe/Dublin"],
    US: ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Pacific/Honolulu"],
    CA: ["America/Vancouver", "America/Edmonton", "America/Toronto", "America/Halifax"],
    SG: ["Asia/Singapore"],
    HK: ["Asia/Hong_Kong"],
    ZA: ["Africa/Johannesburg"],
  };

  const timezones = Object.entries(timezonesByCountry).flatMap(([code, zones]) =>
    zones.map((zone) => ({
      value: zone,
      name: zone.replace("_", " "),
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
    sg: SG,
    hk: HK,
    za: ZA,
  };

  useUnsavedWarning([
    [name, savedName],
    [slug, savedSlug],
    [timezone, savedTimezone],
  ]);

  const submitForm = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!companies.length) return;

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
    toast.success("Changes saved");
    setSavedName(name);
    setSavedSlug(slug);
    setSavedTimezone(timezone);
  };

  const deleteCompanyClick = async () => {
    if (!companies.length) return;
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
    setSavedName("");
    setSavedSlug("");
    setSavedTimezone("");
  };

  useEffect(() => {
    if (!companies.length) return;
    setName(companies[0].name);
    setSavedName(companies[0].name);
    setSlug(companies[0].slug);
    setSavedSlug(companies[0].slug);
    setTimezone(companies[0].timezone);
    setSavedTimezone(companies[0].timezone);
    setDisabled(false);
  }, [companies]);

  return (
    <form onSubmit={submitForm} className="mx-auto max-w-4xl">
      <div className="flex h-12 items-end justify-between gap-4 sm:h-10">
        <div className="flex items-center gap-4">
          <Heading>Settings</Heading>

          {(name !== savedName || slug !== savedSlug || timezone !== savedTimezone) && (
            <Badge color="amber" className="fade-in max-sm:hidden">
              Unsaved changes
            </Badge>
          )}
        </div>

        <Button href="/settings/admins" outline>
          <UserGroupIcon />
          Manage admins
        </Button>
      </div>

      <Divider className="mt-6 mb-10" />

      <Fieldset disabled={disabled}>
        {plan && (
          <>
            <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Subheading>Subscription</Subheading>

                <Text>
                  You&apos;re on the <Strong>{plan.title}</Strong> plan.
                </Text>
              </div>

              <div className="flex items-start gap-4 sm:justify-end">
                {plan.id === 1 ? (
                  <Button href={pricingURL} color="indigo">
                    <BoltIcon />
                    Upgrade
                  </Button>
                ) : (
                  <>
                    <Button href={pricingURL}>
                      <ArrowsRightLeftIcon />
                      Change plan
                    </Button>

                    <Button onClick={() => openStripe(companies[0].stripe_customer_id!)}>
                      <CreditCardIcon />
                      Billing
                    </Button>
                  </>
                )}
              </div>
            </section>

            <Divider className="my-10" soft />
          </>
        )}

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Subheading>Company Name</Subheading>
            <Text>This name appears to employees when they access HowsWork.</Text>
          </div>

          <Field>
            <Input
              aria-label="Company Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              invalid={formErrors.name}
              maxLength={20}
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
              <TextLink
                href={`https://howswork.${timezone.includes("Australia") ? "com.au" : "app"}/${slug}`}
                target="_blank"
              >
                {`https://howswork.${timezone.includes("Australia") ? "com.au" : "app"}/${slug}`}
              </TextLink>
            </Text>
          </div>

          <Field>
            <Input
              aria-label="Company URL"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              invalid={formErrors.slug}
              maxLength={15}
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
              {/* Display company timezone if not included in list */}
              {savedTimezone && !timezones.some((t) => t.value === savedTimezone) && (
                <ListboxOption value={savedTimezone}>
                  <GlobeAltIcon />
                  <ListboxLabel>{savedTimezone}</ListboxLabel>
                </ListboxOption>
              )}

              {timezones.map((tz) => {
                const Flag = flagMap[tz.code];

                return (
                  <ListboxOption key={tz.value} value={tz.value}>
                    <Flag className="w-5 sm:w-4" />
                    <ListboxLabel>{tz.name}</ListboxLabel>
                  </ListboxOption>
                );
              })}
            </Listbox>
          </Field>
        </section>

        <Divider className="my-10" soft />

        <div className="flex flex-col-reverse items-end justify-between gap-10 sm:flex-row">
          <Button type="button" onClick={() => setAlertOpen(true)}>
            <TrashIcon />
            Delete company
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
