"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DateTime } from "luxon";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { CalendarIcon, ChatBubbleOvalLeftIcon, ClipboardIcon } from "@heroicons/react/16/solid";
import StatusData from "@/data/status.json";
import type { ConcernType } from "@/types";
import { concernStatusColor } from "@/utils/helpers";
import { useCompanies } from "@/hooks/useCompanies";
import { Heading, Subheading } from "@/components/ui/heading";
import EmptyState from "@/components/EmptyState";
import Breadcrumb from "@/components/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Divider } from "@/components/ui/divider";
import { Button } from "@/components/ui/button";
import Activity from "@/components/concerns/concern/Activity";
import Comment from "@/components/concerns/concern/Comment";
import Status from "@/components/concerns/concern/Status";
import Issues from "@/components/concerns/concern/Issues";
import SuggestActions from "@/components/SuggestActions";
import { getConcernData } from "./actions";

export default function Concern() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companies = useCompanies();
  const [concern, setConcern] = useState<ConcernType>();
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [issues, setIssues] = useState<number[]>([]);
  const [riskID, setRiskID] = useState(0);
  const date = concern ? DateTime.fromISO(concern.created_at) : undefined; // Convert to date object

  const getConcern = async () => {
    if (!companies.length) return;
    const result = await getConcernData(Number(params.id), companies[0].id);

    if (result.error) {
      setError(result.error);
      return;
    }

    setConcern(result.data);
    setRiskID(result.risk?.id);

    setStatus(
      result.data?.activity.find((i): i is { created_at: string; status: number } => "status" in i)?.status ?? 0
    ); // Latest status or default to "Awaiting review"

    setIssues(result.data?.issues ?? []);
    setDisabled(false);
  };

  useEffect(() => {
    getConcern();
  }, [companies, status]);

  return (
    <div className="mx-auto max-w-6xl">
      {concern ? (
        <div className="fade-in">
          <Breadcrumb href={`/concerns${searchParams.size ? `?${searchParams.toString()}` : ""}`}>Concerns</Breadcrumb>

          <div className="lg:mt-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Heading>Concern HW-{concern.tracking}</Heading>
              <Badge color={concernStatusColor(status)}>{StatusData.find((i) => i.id === status)?.title}</Badge>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:mt-2.5 sm:flex-row">
              <time className="flex items-center gap-3">
                <CalendarIcon className="size-4 text-zinc-400 dark:text-zinc-500" />
                <Text className="text-zinc-950! dark:text-white!">{date?.toLocal().toFormat("dd LLL yyyy")}</Text>
              </time>

              <div className="flex flex-1 gap-4 sm:justify-end">
                <Status
                  concernID={Number(params.id)}
                  val={status}
                  setVal={setStatus}
                  disabled={disabled}
                  setDisabled={setDisabled}
                />

                <Button
                  onClick={() => setDialogOpen(true)}
                  className="whitespace-nowrap"
                  disabled={disabled}
                  color="indigo"
                >
                  <ChatBubbleOvalLeftIcon />
                  Add a comment
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-8 sm:flex-row">
            <div className="top-8 flex w-full flex-col gap-8 self-start sm:sticky">
              <div>
                <Subheading>Details</Subheading>
                <Divider className="mt-4" />
                <Text className="mt-5 whitespace-pre-line">{concern.details}</Text>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <Subheading>Issues ({issues.length})</Subheading>
                  {/*<span className="text-sm text-zinc-500 sm:text-xs dark:text-zinc-400">Select all that apply</span>*/}
                </div>

                <Divider className="mt-4" />

                <Issues
                  //concernID={Number(params.id)}
                  val={issues}
                  //setVal={setIssues}
                  //disabled={disabled}
                  //setDisabled={setDisabled}
                />
              </div>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <SuggestActions riskID={riskID} disabled={disabled} setDisabled={setDisabled} />

                <Button onClick={() => router.push(`/risk-register/?concern=${params.id}`)} outline>
                  <ClipboardIcon />
                  View in Risk Register
                </Button>
              </div>
            </div>

            <div className="w-full">
              <Subheading>Activity</Subheading>
              <Divider className="mt-4" />
              <Activity date={concern.created_at} data={concern.activity} />
            </div>
          </div>

          <Comment
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            concernID={Number(params.id)}
            disabled={disabled}
            setDisabled={setDisabled}
            getConcern={getConcern}
          />
        </div>
      ) : (
        error && (
          <EmptyState>
            <ExclamationCircleIcon className="size-16 text-zinc-400 sm:size-12 dark:text-zinc-500" />
            <Subheading className="mt-2 text-center">{error}</Subheading>
          </EmptyState>
        )
      )}
    </div>
  );
}
