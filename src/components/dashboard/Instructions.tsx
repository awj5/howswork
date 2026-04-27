import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, UsersIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useUserContext } from "@/hooks/useUserContext";
import { Heading } from "@/components/ui/heading";
import EmptyState from "@/components/EmptyState";
import Doodle from "@/components/Doodle";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

type InstructionsProps = {
  noStaffContacts: boolean;
};

export default function Instructions(props: InstructionsProps) {
  const router = useRouter();
  const { user } = useUserContext();
  const [doodleLoaded, setDoodleLoaded] = useState(false);

  return (
    <EmptyState className={`p-0! sm:w-2xl! sm:flex-row ${doodleLoaded ? "fade-in" : "opacity-0"}`}>
      <Doodle doodles={23} onLoad={() => setDoodleLoaded(true)} className="hidden w-xs sm:inline" />

      <div className="w-xs">
        <Heading>Welcome {user?.first_name}</Heading>
        <Text>Two steps to get up and running.</Text>

        <div className="relative mt-4">
          <span aria-hidden="true" className="absolute top-0 left-4 -ml-px h-full w-0.5 bg-zinc-200 dark:bg-white/10" />

          <div className="relative flex flex-col gap-8">
            <div className="flex gap-3">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-zinc-500 ring-8 ring-white dark:text-zinc-400 dark:ring-zinc-900 ${!props.noStaffContacts ? "bg-green-500" : "bg-zinc-100 dark:bg-zinc-800"}`}
              >
                {!props.noStaffContacts ? <CheckIcon className="size-5 text-white" /> : "1"}
              </div>

              <div className="flex flex-1 flex-col items-start gap-4 pt-1">
                <Text>Add your team's email addresses or mobile numbers.</Text>

                <Button onClick={() => router.push("/people")} outline disabled={!props.noStaffContacts}>
                  <UsersIcon />
                  Add staff contacts
                </Button>
              </div>
            </div>

            <div className="flex gap-3 bg-white dark:bg-zinc-900">
              <div className="flex size-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 ring-8 ring-white dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-900">
                2
              </div>

              <div className="flex flex-1 flex-col items-start gap-4 pt-1">
                <Text>Choose a check-in frequency. HowsWork handles the rest.</Text>

                <Button href="/assessments" outline>
                  <CheckCircleIcon />
                  Schedule first check-in
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmptyState>
  );
}
