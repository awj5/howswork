"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DocumentPlusIcon, ArrowDownTrayIcon, ClipboardIcon } from "@heroicons/react/16/solid";
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
import ExportDialog from "@/components/risk-register/ExportDialog";
import RiskDialog from "@/components/risk-register/RiskDialog";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { deleteRisk, getRisksData } from "./actions";

export default function RiskRegister() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const companies = useCompanies();
  const [disabled, setDisabled] = useState(false);
  const [sort, setSort] = useState("status");
  const [risks, setRisks] = useState<RiskType[]>();
  const [editID, setEditID] = useState(0);
  const [deleteID, setDeleteID] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [issueFilter, setIssueFilter] = useState<string>();
  const [concernID, setConcernID] = useState<string>();
  const [checkInID, setCheckInID] = useState<string>();
  const [doodleLoaded, setDoodleLoaded] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 50;
  const page = Number(searchParams.get("page")) || 1; // Default to page 1;

  const addClick = () => {
    setEditID(0);
    setRiskDialogOpen(true);
  };

  const deleteClick = async () => {
    if (!deleteID) return;
    setAlertOpen(false);
    setDisabled(true);
    const result = await deleteRisk(deleteID);
    setDisabled(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Success
    toast.success("Risk deleted");

    if (searchParams.get("page") && searchParams.get("page") !== "1") {
      const issue = searchParams.get("issue");
      router.push(issue ? `/risk-register?issue=${issue}` : "/risk-register"); // Clear page param (keep issue)
    } else {
      getRisks(); // Reload list
    }
  };

  const getRisks = async () => {
    if (!companies.length) return;

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get data
    const result = await getRisksData(companies[0].id, from, to, sort, issueFilter, concernID, checkInID);

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
    const concern = searchParams.get("concern");
    setConcernID(concern ? concern : concernID ? "" : undefined);
    const checkIn = searchParams.get("check-in");
    setCheckInID(checkIn ? checkIn : checkInID ? "" : undefined);
  }, [searchParams]);

  useEffect(() => {
    getRisks();
  }, [companies, page, sort, issueFilter, concernID, checkInID]);

  return (
    <>
      {risks && (risks.length || issueFilter !== undefined || concernID !== undefined || checkInID !== undefined) ? (
        <div className="fade-in">
          <div className="flex flex-col justify-between gap-x-6 gap-y-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <div className="flex h-12 items-end sm:h-10">
                <Heading>Risk Register</Heading>
              </div>

              {!concernID && !checkInID && <Filters sort={sort} setSort={setSort} disabled={disabled} />}
            </div>

            {!concernID && !checkInID && (
              <div className="flex gap-4">
                <Button onClick={() => setExportDialogOpen(true)} disabled={disabled}>
                  <ArrowDownTrayIcon />
                  Export
                </Button>

                <Button onClick={addClick} color="indigo" disabled={disabled}>
                  <DocumentPlusIcon />
                  Add risk
                </Button>
              </div>
            )}
          </div>

          {risks.length ? (
            <>
              <Table grid className="mt-8 [--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
                <TableHead>
                  <TableRow>
                    <TableHeader>Raised</TableHeader>
                    <TableHeader>Level</TableHeader>
                    <TableHeader>Source</TableHeader>
                    <TableHeader>Issues</TableHeader>
                    <TableHeader>Description</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Reviewed</TableHeader>
                    <TableHeader>Response</TableHeader>
                    <TableHeader>Resolved</TableHeader>
                    <TableHeader>Owner</TableHeader>

                    <TableHeader className="relative w-0">
                      <span className="sr-only">Actions</span>
                    </TableHeader>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {risks.map((risk) => (
                    <Risk
                      key={risk.id}
                      data={risk}
                      timezone={companies[0].timezone}
                      setRiskDialogOpen={setRiskDialogOpen}
                      setEditID={setEditID}
                      disabled={disabled}
                      setDisabled={setDisabled}
                      setAlertOpen={setAlertOpen}
                      setDeleteID={setDeleteID}
                      plan={companies[0].plan ?? 0}
                    />
                  ))}
                </TableBody>
              </Table>

              {(concernID || checkInID) && (
                <div className="mt-6 flex justify-center">
                  <Button href="/risk-register" outline>
                    <ClipboardIcon />
                    View all risks
                  </Button>
                </div>
              )}
            </>
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
              Concerns and flagged check-ins are automatically logged in the risk register. Risks can also be added
              manually.
            </Text>

            <Button onClick={addClick} color="indigo" className="mt-6">
              <DocumentPlusIcon />
              Add risk
            </Button>
          </EmptyState>
        )
      )}

      <ExportDialog
        open={exportDialogOpen}
        setOpen={setExportDialogOpen}
        disabled={disabled}
        setDisabled={setDisabled}
      />

      <RiskDialog
        open={riskDialogOpen}
        setOpen={setRiskDialogOpen}
        disabled={disabled}
        setDisabled={setDisabled}
        getRisks={getRisks}
        id={editID}
      />

      <Alert open={alertOpen} onClose={setAlertOpen}>
        <AlertTitle>Are you sure you want to delete this risk?</AlertTitle>

        <AlertDescription>
          This will permanently delete this manually added risk. This action cannot be undone.
        </AlertDescription>

        <AlertActions>
          <Button plain onClick={() => setAlertOpen(false)}>
            Cancel
          </Button>

          <Button onClick={deleteClick} color="red">
            Delete
          </Button>
        </AlertActions>
      </Alert>
    </>
  );
}
