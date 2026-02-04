"use client";

import { useEffect, useRef, useState } from "react";
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
import Doodle from "@/components/Doodle";

export default function Concerns() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companies = useCompanies();
  const searchRef = useRef<string>(undefined);
  const [search, setSearch] = useState<string>();
  const [issueFilter, setIssueFilter] = useState<string>();
  const [debouncedSearch, setDebouncedSearch] = useState<string>();
  const [concerns, setConcerns] = useState<ConcernType[]>();
  const [noCheckIns, setNoCheckIns] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 25;
  const page = Number(searchParams.get("page")) || 1; // Default to page 1

  useEffect(() => {
    // Delay API call
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setIssueFilter(searchParams.get("issue") ?? "");
  }, [searchParams.get("issue")]);

  useEffect(() => {
    if (!companies.length) return;

    const getConcerns = async () => {
      // Pagination
      if (page !== 1 && debouncedSearch !== searchRef.current) {
        // Reset to page 1 on search or filter
        router.replace("/concerns");
        return;
      }

      searchRef.current = debouncedSearch;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Get Concerns
      let concernsQuery = supabase
        .from("concerns")
        .select("id, tracking, created_at, issues", {
          count: "exact",
        })
        .eq("company_id", companies[0].id);

      if (debouncedSearch) {
        const normalizedSearch = debouncedSearch.replace(/^HW-/i, "").trim(); // Strip HW-
        concernsQuery = concernsQuery.ilike("tracking", `%${normalizedSearch}%`);
      }

      if (issueFilter) concernsQuery = concernsQuery.contains("issues", issueFilter);

      const {
        data: concernsData,
        error: concernsError,
        count: concernsCount,
      } = await concernsQuery.order("created_at", { ascending: false }).range(from, to);

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
      const concernIDs = concernsData.map((i) => i.id);

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

      concernsWithStatus.sort((a, b) => getPriority(a.status) - getPriority(b.status)); // Sort by status priority, then by date
      setConcerns(concernsWithStatus);
      setPageCount(Math.max(1, Math.ceil(concernsCount! / pageSize)));
    };

    getConcerns();
  }, [companies, page, issueFilter, debouncedSearch]);

  return (
    <div className="mx-auto max-w-6xl">
      {concerns && (concerns.length || search !== undefined || issueFilter !== undefined) ? (
        <div className="fade-in">
          <div className="flex h-12 items-end sm:h-10">
            <Heading>Concerns</Heading>
          </div>

          <Search query={search} setQuery={setSearch} />

          {concerns.length ? (
            <Table striped className="mt-8 [--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
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
          ) : (
            <Text className="mt-8">No concerns found</Text>
          )}

          <TablePagination page={page} pageCount={pageCount} route="/concerns" params={["issue"]} />
        </div>
      ) : concerns ? (
        <EmptyState className="fade-in">
          <Doodle doodles={13} />
          <Subheading className="mt-4">No concerns reported</Subheading>

          <Text className="mt-1 text-center">
            Employees can raise anonymous concerns anytime using a check-in PIN. All submissions will appear here.
          </Text>
        </EmptyState>
      ) : (
        noCheckIns && (
          <EmptyState className="fade-in">
            <Doodle doodles={9} />
            <Subheading className="mt-4">Concern reporting not active</Subheading>

            <Text className="mt-1 text-center">
              Employees need a check-in PIN to raise concerns. Schedule your first check-in to enable reporting.
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

function getPriority(status: number | undefined) {
  if (status === undefined || status === 1) return 0;
  if (status === 2) return 1;
  if (status === 3) return 2;
  return 3; // Status 4 or 5
}
