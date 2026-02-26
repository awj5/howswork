import { NextRequest, NextResponse } from "next/server";
import { utils, write } from "xlsx";
import { DateTime } from "luxon";
import StatusData from "@/data/status.json";
import IssuesData from "@/data/issues.json";
import { toLocalEndOfDayISO, toLocalMidnightISO } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import { decrypt } from "@/utils/encryption";

export async function POST(req: NextRequest) {
  try {
    const { companyID, start, end, format } = await req.json();
    const supabase = await createClient();

    let risksQuery = supabase
      .from("risks")
      .select(
        "date_raised, level, concern_tracking, check_in_date, issues, description, status, date_reviewed, response, date_resolved, owner"
      )
      .eq("company_id", companyID)
      .order("date_raised", { ascending: false });

    if (start) risksQuery = risksQuery.gte("date_raised", toLocalMidnightISO(start));
    if (end) risksQuery = risksQuery.lte("date_raised", toLocalEndOfDayISO(end));

    const { data: risksData, error: risksError } = await risksQuery;
    if (risksError) throw new Error(risksError.message);

    // Create file
    const formattedData = risksData.map((row) => {
      const formatted = { ...row };
      const dateRaised = DateTime.fromISO(row.date_raised);
      const dateReviewed = row.date_reviewed ? DateTime.fromISO(row.date_reviewed) : undefined;
      const dateResolved = row.date_resolved ? DateTime.fromISO(row.date_resolved) : undefined;
      const checkInDate = row.check_in_date ? DateTime.fromISO(row.check_in_date) : undefined;

      // Dates
      formatted["date_raised"] = dateRaised
        .toLocal()
        .toLocaleString({ day: "numeric", month: "numeric", year: "numeric" });

      if (dateReviewed) {
        formatted["date_reviewed"] = dateReviewed
          .toLocal()
          .toLocaleString({ day: "numeric", month: "numeric", year: "numeric" });
      }

      if (dateResolved) {
        formatted["date_resolved"] = dateResolved
          .toLocal()
          .toLocaleString({ day: "numeric", month: "numeric", year: "numeric" });
      }

      if (checkInDate) {
        formatted["check_in_date"] = checkInDate
          .toLocal()
          .toLocaleString({ day: "numeric", month: "numeric", year: "numeric" });
      }

      formatted["level"] = row.level === 1 ? "Low" : row.level === 2 ? "Medium" : "High"; // Level
      if (row.concern_tracking) formatted["concern_tracking"] = `HW-${row.concern_tracking}`; // Tracking

      // Issues
      formatted["issues"] = row.issues?.length
        ? row.issues.map((issue: number) => IssuesData.find((i) => i.id === issue)?.tag).join(", ")
        : "";

      // Description
      try {
        formatted["description"] = decrypt(row.description);
      } catch {
        formatted["description"] = "[decryption error]";
      }

      formatted["status"] = StatusData.find((i) => i.id === row.status)?.title.replace("New response", "Open"); // Status

      // Response
      if (row.response) {
        try {
          formatted["response"] = decrypt(row.response);
        } catch {
          formatted["response"] = "[decryption error]";
        }
      }

      return formatted;
    });

    const renamedData = formattedData.map((row) => ({
      Raised: row.date_raised,
      Level: row.level,
      "Concern tracking": row.concern_tracking,
      "Check-in date": row.check_in_date,
      Issues: row.issues,
      Description: row.description,
      Status: row.status,
      Reviewed: row.date_reviewed,
      Response: row.response,
      Resolved: row.date_resolved,
      Owner: row.owner,
    }));

    const sheet = utils.json_to_sheet(renamedData);
    const book = utils.book_new();
    utils.book_append_sheet(book, sheet, "Risks");
    const buffer = write(book, { type: "buffer", bookType: format });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          format === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv",
        "Content-Disposition": `attachment; filename="risk-register.${format}"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
