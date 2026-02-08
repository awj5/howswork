"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { CalendarIcon, HashtagIcon, TrashIcon, QrCodeIcon } from "@heroicons/react/16/solid";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/utils/supabase/client";
import { checkInStatusText } from "@/utils/helpers";
import SentimentsData from "@/data/sentiments.json";
import type { CheckInIssueType, CheckInStatType, CheckInType } from "@/types";
import { useCompanies } from "@/hooks/useCompanies";
import { Heading, Subheading } from "@/components/ui/heading";
import Breadcrumb from "@/components/Breadcrumb";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import EmptyState from "@/components/EmptyState";
import Stat from "@/components/check-in/Stat";
import Issues from "@/components/check-in/Issues";
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
      if (!companies.length) return;
      const { data: checkInData, error: checkInError } = await supabase
        .from("check_ins")
        .select("id, start, status, repeat, pin, contact_count")
        .eq("id", Number(params.id))
        .neq("status", 1)
        .single();

      if (checkInError) {
        console.error(checkInError);
        setError("Check-in not found");
        return;
      }

      // Get feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("feedback")
        .select("id, sentiment, issues")
        .eq("check_in_id", checkInData.id);

      if (feedbackError) {
        console.error(feedbackError);
        setError("Internal server error");
        return;
      }

      // Get concerns
      const { data: concernsData, error: concernsError } = await supabase
        .from("concerns")
        .select("id")
        .eq("check_in_id", checkInData.id);

      if (concernsError) {
        console.error(concernsError);
        setError("Internal server error");
        return;
      }

      // Get issues
      const issueCounts = new Map<number, number>();

      feedbackData.forEach((feedback) => {
        feedback.issues?.forEach((id: number) => {
          issueCounts.set(id, (issueCounts.get(id) || 0) + 1);
        });
      });

      const issues = Array.from(issueCounts, ([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count); // Order by most common

      // Generate stats
      const stats: CheckInStatType[] = [];
      let participationTrend = 0;
      let sentimentTrend = 0;
      let concernTrend = 0;
      const participation = Math.round((feedbackData.length / checkInData.contact_count) * 100); // Percentage

      // Average and convert to percentage
      const sentiment = feedbackData.length
        ? Math.round(
            (feedbackData.reduce((sum, feedback) => sum + feedback.sentiment, 0) / feedbackData.length) *
              (100 / SentimentsData.length)
          )
        : 0;

      // Get previous check-in
      const { data: prevCheckInData, error: prevCheckInError } = await supabase
        .from("check_ins")
        .select("id, contact_count")
        .eq("company_id", companies[0].id)
        .lt("start", checkInData.start)
        .order("start", { ascending: false })
        .limit(1);

      if (prevCheckInError) {
        console.error(prevCheckInError);
        setError("Internal server error");
        return;
      }

      if (prevCheckInData.length) {
        // Get previous check-in feedback
        const { data: prevFeedbackData, error: prevFeedbackError } = await supabase
          .from("feedback")
          .select("id, sentiment")
          .eq("check_in_id", prevCheckInData[0].id);

        if (prevFeedbackError) {
          console.error(prevFeedbackError);
          setError("Internal server error");
          return;
        }

        // Get previous check-in concerns
        const { data: prevConcernsData, error: prevConcernsError } = await supabase
          .from("concerns")
          .select("id")
          .eq("check_in_id", prevCheckInData[0].id);

        if (prevConcernsError) {
          console.error(prevConcernsError);
          setError("Internal server error");
          return;
        }

        const prevParticipation = Math.round((prevFeedbackData.length / prevCheckInData[0].contact_count) * 100); // Percentage

        // Average and convert to percentage
        const prevSentiment = prevFeedbackData.length
          ? Math.round(
              (prevFeedbackData.reduce((sum, feedback) => sum + feedback.sentiment, 0) / prevFeedbackData.length) *
                (100 / SentimentsData.length)
            )
          : 0;

        // Calculate trends
        if (prevParticipation)
          participationTrend = Math.round(((participation - prevParticipation) / prevParticipation) * 100); // Percentage

        if (prevSentiment) sentimentTrend = Math.round(((sentiment - prevSentiment) / prevSentiment) * 100); // Percentage

        if (prevConcernsData.length)
          concernTrend = Math.round(((concernsData.length - prevConcernsData.length) / prevConcernsData.length) * 100); // Percentage
      }

      stats.push({
        title: "Participation",
        primary: participation,
        secondary: participationTrend,
        percentage: true,
      });

      stats.push({
        title: "Sentiment",
        primary: sentiment,
        secondary: sentimentTrend,
        percentage: true,
        sentiment: true,
      });

      stats.push({
        title: "Concerns raised",
        primary: concernsData.length,
        secondary: concernTrend,
      });

      // Add stats to check-in
      const data = {
        ...checkInData,
        stats,
        issues,
      };

      setCheckIn(data);
    };

    getCheckIn();
  }, [companies]);

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

              <Badge color={checkIn.status === 4 ? "green" : checkIn.status === 3 ? "amber" : "zinc"}>
                {checkInStatusText(checkIn.status)}
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

                {checkIn.status !== 2 && (
                  <div className="flex items-center gap-3">
                    <HashtagIcon className="size-4 text-gray-400 dark:text-gray-500" />
                    <Text className="text-zinc-950! dark:text-white!">PIN: {checkIn.pin}</Text>
                  </div>
                )}
              </div>

              {checkIn.status === 3 ? (
                <Button onClick={() => null} color="indigo">
                  <QrCodeIcon />
                  Generate QR code
                </Button>
              ) : (
                checkIn.status === 2 && (
                  <Button onClick={() => setAlertOpen(true)} outline disabled={disabled}>
                    <TrashIcon />
                    Remove
                  </Button>
                )
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {checkIn.stats?.map((stat) => (
              <Stat key={stat.title} data={stat} status={checkIn.status} />
            ))}
          </div>

          <Subheading className="mt-12">Issues experienced</Subheading>
          <Issues data={checkIn.issues} />
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
