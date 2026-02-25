import { NextRequest, NextResponse } from "next/server";
import { utils, write } from "xlsx";
import { toLocalEndOfDayISO, toLocalMidnightISO } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { companyID, start, end, format } = await req.json();
    const supabase = await createClient();

    let risksQuery = supabase
      .from("risks")
      .select(
        "concern_tracking, check_in_date, date_raised, date_reviewed, issues, description, level, status, owner, response, date_resolved"
      )
      .eq("company_id", companyID)
      .order("date_raised", { ascending: false });

    if (start) risksQuery = risksQuery.gte("date_raised", toLocalMidnightISO(start));
    if (end) risksQuery = risksQuery.lte("date_raised", toLocalEndOfDayISO(end));

    const { data: risksData, error: risksError } = await risksQuery;
    if (risksError) throw new Error(risksError.message);

    // Create file
    const sheet = utils.json_to_sheet(risksData);
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
