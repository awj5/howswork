"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/16/solid";
import type { ConcernType } from "@/types";
import { useCompanies } from "@/hooks/useCompanies";
import { createClient } from "@/utils/supabase/client";
import { Heading, Subheading } from "@/components/ui/heading";
import Search from "@/components/concerns/Search";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EmptyState from "@/components/EmptyState";
import { Text } from "@/components/ui/text";
import { TablePagination } from "@/components/TablePagination";
import Concern from "@/components/concerns/Concern";
import { Button } from "@/components/ui/button";

export default function Concerns() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companies = useCompanies();
  const [concerns, setConcerns] = useState<ConcernType[]>();
  const [noCheckIns, setNoCheckIns] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 10;
  const page = Number(searchParams.get("page")) || 1; // Default to page 1

  useEffect(() => {
    if (!companies.length) return;

    const getConcerns = async () => {
      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Get Concerns
      const {
        data: concernsData,
        error: concernsError,
        count: concernsCount,
      } = await supabase
        .from("concerns")
        .select("id, tracking, created_at", {
          count: "exact",
        })
        .eq("company_id", companies[0].id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (concernsError) {
        console.error(concernsError);
        return;
      }

      if (!concernsData.length) {
        // Check if company has check-ins
        const { data: checkInsData, error: checkInsError } = await supabase
          .from("check_ins")
          .select("id")
          .eq("company_id", companies[0].id)
          .limit(1);

        if (checkInsError) {
          console.error(checkInsError);
          return;
        }

        if (!checkInsData.length) {
          setNoCheckIns(true);
          return;
        }
      }

      // Get status of each concern
      const concernIDs = concernsData.map((c) => c.id);

      const { data: concernStatusData, error: concernStatusError } = await supabase
        .from("concern_status")
        .select("concern_id, status")
        .in("concern_id", concernIDs)
        .order("created_at", { ascending: false });

      if (concernStatusError) {
        console.error(concernStatusError);
        return;
      }

      // Map latest status to each concern
      const statusMap = new Map<number, number>();

      for (const row of concernStatusData) {
        if (!statusMap.has(row.concern_id)) statusMap.set(row.concern_id, row.status);
      }

      // Add status
      const concernsWithStatus = concernsData.map((concern) => ({
        ...concern,
        status: statusMap.get(concern.id),
      }));

      setConcerns(concernsWithStatus);
      setPageCount(Math.max(1, Math.ceil(concernsCount! / pageSize)));
    };

    getConcerns();
  }, [companies, page]);

  return (
    <div className="mx-auto max-w-6xl">
      {concerns && concerns.length ? (
        <>
          <div className="flex h-12 items-end sm:h-10">
            <Heading>Concerns</Heading>
          </div>

          <Search />

          <Table className="mt-8 [--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
            <TableHead>
              <TableRow>
                <TableHeader>Tracking</TableHeader>
                <TableHeader>Date &amp; Time</TableHeader>
                <TableHeader>Status</TableHeader>
              </TableRow>
            </TableHead>

            <TableBody>
              {concerns.map((concern) => (
                <Concern key={concern.id} data={concern} timezone={companies[0].timezone} />
              ))}
            </TableBody>
          </Table>

          <TablePagination page={page} pageCount={pageCount} route="/concerns" />
        </>
      ) : (
        noCheckIns && (
          <EmptyState>
            <Subheading>No concerns yet</Subheading>
            <Text className="mt-1 text-center">
              Employees need a check-in PIN to submit anonymous concerns. Schedule your first check-in to enable
              reporting.
            </Text>

            <Button onClick={() => router.push("/check-ins")} outline className="mt-6">
              <CheckCircleIcon />
              Schedule first check-in
            </Button>
          </EmptyState>
        )
      )}
    </div>
  );
}
