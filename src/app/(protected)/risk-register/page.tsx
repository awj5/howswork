"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DocumentPlusIcon, ArrowDownTrayIcon } from "@heroicons/react/16/solid";
import type { RiskType } from "@/types";
import { useCompanies } from "@/hooks/useCompanies";
import { Heading, Subheading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import Filters from "@/components/risk-register/Filters";
import { TablePagination } from "@/components/TablePagination";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Risk from "@/components/risk-register/Risk";
import { Text } from "@/components/ui/text";
import EmptyState from "@/components/EmptyState";
import Doodle from "@/components/Doodle";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getRisksData, addRisk } from "./actions";

export default function RiskRegister() {
  const searchParams = useSearchParams();
  const companies = useCompanies();
  const [disabled, setDisabled] = useState(false);
  const [sort, setSort] = useState("status");
  const [risks, setRisks] = useState<RiskType[]>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [issueFilter, setIssueFilter] = useState<string>();
  const [doodleLoaded, setDoodleLoaded] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 50;
  const page = Number(searchParams.get("page")) || 1; // Default to page 1

  const addClick = async () => {
    setDisabled(true);
    const result = await addRisk(companies[0]?.id);
    setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success("Risk added");
    getRisks();
  };

  const getRisks = async () => {
    if (!companies.length) return;

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get data
    const result = await getRisksData(companies[0].id, from, to, issueFilter);

    if (result.error) {
      console.error(result.error);
      return;
    }

    setRisks(result.data);
    setPageCount(Math.max(1, Math.ceil(result.count! / pageSize)));
  };

  useEffect(() => {
    // Using state to make sure no risks empty state is not shown when risks exist
    const issue = searchParams.get("issue");
    setIssueFilter(issue ? issue : issueFilter ? "" : undefined);
  }, [searchParams]);

  useEffect(() => {
    getRisks();
  }, [companies, page, issueFilter]);

  return (
    <div className="mx-auto max-w-6xl">
      {risks && (risks.length || issueFilter !== undefined) ? (
        <div className="fade-in">
          <div className="flex flex-col justify-between gap-x-6 gap-y-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <div className="flex h-12 items-end sm:h-10">
                <Heading>Risk Register</Heading>
              </div>

              <Filters sort={sort} setSort={setSort} disabled={disabled} />
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setDialogOpen(true)} outline disabled={disabled}>
                <ArrowDownTrayIcon />
                Export
              </Button>

              <Button onClick={addClick} color="indigo" disabled={disabled}>
                <DocumentPlusIcon />
                Add risk
              </Button>
            </div>
          </div>

          {risks.length ? (
            <Table grid className="mt-8 [--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
              <TableHead>
                <TableRow>
                  <TableHeader>Raised</TableHeader>
                  <TableHeader>Issues</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Level</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Reviewed</TableHeader>
                  <TableHeader>Owner</TableHeader>
                </TableRow>
              </TableHead>

              <TableBody>
                {risks.map((risk) => (
                  <Risk key={risk.id} data={risk} timezone={companies[0].timezone} />
                ))}
              </TableBody>
            </Table>
          ) : (
            <Text className="mt-8">No risks found</Text>
          )}

          <TablePagination page={page} pageCount={pageCount} route="/risk-register" params={["issue"]} />
        </div>
      ) : (
        risks && (
          <EmptyState className={doodleLoaded ? "fade-in" : "opacity-0"}>
            <Doodle doodles={14} onLoad={() => setDoodleLoaded(true)} />
            <Subheading className="mt-4">No risks logged</Subheading>

            <Text className="mt-1 text-center">
              Concerns and check-in trends are automatically logged in the risk register. Risks can also be added
              manually.
            </Text>

            <Button onClick={addClick} outline className="mt-6">
              <DocumentPlusIcon />
              Add risk
            </Button>
          </EmptyState>
        )
      )}

      <Dialog open={dialogOpen} onClose={setDialogOpen}>
        <DialogTitle>Schedule a check-in</DialogTitle>

        <DialogDescription className="text-wrap!">
          Employees will be notified when the check-in begins and can respond anonymously using a shared access PIN.
        </DialogDescription>

        <DialogBody></DialogBody>

        <DialogActions>
          <Button plain onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>

          <Button onClick={() => null} color="indigo" disabled={disabled}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
