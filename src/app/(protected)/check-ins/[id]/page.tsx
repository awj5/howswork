"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { CalendarIcon, HashtagIcon, TrashIcon, QrCodeIcon } from "@heroicons/react/16/solid";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/utils/supabase/client";
import type { CheckInType } from "@/types";
import { useCompanies } from "@/hooks/useCompanies";
import { Heading, Subheading } from "@/components/ui/heading";
import Breadcrumb from "@/components/Breadcrumb";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import EmptyState from "@/components/EmptyState";
import { removeCheckIn } from "./actions";

export default function CheckIn() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const companies = useCompanies();
  const [checkIn, setCheckIn] = useState<CheckInType>();
  const [alertOpen, setAlertOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState("");
  const date = checkIn ? DateTime.fromISO(checkIn.start).toUTC() : undefined;

  const removeClick = async () => {
    if (!companies.length) return;
    setAlertOpen(false);
    setDisabled(true);
    const result = await removeCheckIn(Number(params.id), companies[0].id);
    setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success("Check-in removed");
    router.push(`/check-ins${searchParams.size ? `?${searchParams.toString()}` : ""}`);
  };

  useEffect(() => {
    const getCheckIn = async () => {
      const { data: checkInData, error: checkInError } = await supabase
        .from("check_ins")
        .select("id, start, status, repeat, pin")
        .eq("id", Number(params.id))
        .neq("status", "Upcoming")
        .single();

      if (checkInError) {
        console.error(checkInError);
        setError("Check-in not found");
        return;
      }

      setCheckIn(checkInData);
    };

    getCheckIn();
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      {checkIn && companies.length ? (
        <div className="fade-in">
          <Breadcrumb href={`/check-ins${searchParams.size ? `?${searchParams.toString()}` : ""}`}>
            Check-ins
          </Breadcrumb>

          <div className="lg:mt-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Heading>Check-in with {companies[0].name}</Heading>

              <Badge color={checkIn.status === "Closed" ? "green" : checkIn.status === "Open" ? "amber" : "zinc"}>
                {checkIn.status}
              </Badge>
            </div>

            <div className="mt-2.5 flex flex-col justify-between gap-4 sm:flex-row">
              <div className="flex gap-10 py-1.5">
                <time className="flex items-center gap-3">
                  <CalendarIcon className="size-4 text-gray-400 dark:text-gray-500" />

                  <Text className="text-zinc-950! dark:text-white!">
                    {date?.setZone(companies[0].timezone).toFormat("dd LLL yyyy")}
                  </Text>
                </time>

                {checkIn.status !== "Scheduled" && (
                  <div className="flex items-center gap-3">
                    <HashtagIcon className="size-4 text-gray-400 dark:text-gray-500" />
                    <Text className="text-zinc-950! dark:text-white!">PIN: {checkIn.pin}</Text>
                  </div>
                )}
              </div>

              {checkIn.status === "Open" ? (
                <Button onClick={() => null} color="indigo">
                  <QrCodeIcon />
                  Generate QR code
                </Button>
              ) : (
                checkIn.status === "Scheduled" && (
                  <Button onClick={() => setAlertOpen(true)} outline disabled={disabled}>
                    <TrashIcon />
                    Remove
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      ) : (
        error && (
          <EmptyState>
            <ExclamationCircleIcon className="size-16 text-gray-400 sm:size-12 dark:text-gray-500" />
            <Subheading className="mt-2 text-center">{error}</Subheading>
          </EmptyState>
        )
      )}

      <Alert open={alertOpen} onClose={setAlertOpen}>
        <AlertTitle>Are you sure you want to remove this check-in?</AlertTitle>
        <AlertDescription>This action cannot be undone.</AlertDescription>

        <AlertActions>
          <Button plain onClick={() => setAlertOpen(false)}>
            Cancel
          </Button>

          <Button onClick={removeClick} color="red">
            Remove
          </Button>
        </AlertActions>
      </Alert>
    </div>
  );
}
