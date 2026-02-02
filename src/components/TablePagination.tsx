import { useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from "@/components/ui/pagination";

type TablePaginationProps = {
  page: number;
  pageCount: number;
  route: string;
  params?: string[];
};

export function TablePagination(props: TablePaginationProps) {
  const searchParams = useSearchParams();
  let urlParams = "";

  if (props.params) {
    // Include params with page number
    for (const param of props.params) {
      const val = searchParams.get(param);
      if (val) urlParams = urlParams + `&${param}=${encodeURIComponent(val)}`;
    }
  }

  return (
    <>
      {props.pageCount > 1 && (
        <Pagination className="mt-6">
          <PaginationPrevious
            href={props.page !== 1 ? `${props.route}?page=${props.page - 1}${urlParams}` : undefined}
          />

          <PaginationList>
            {Array.from({ length: Math.min(4, props.pageCount) }, (_, i) => {
              const pageNumber = i + 1;

              return (
                <PaginationPage
                  key={pageNumber}
                  href={`${props.route}?page=${pageNumber}${urlParams}`}
                  current={pageNumber === props.page}
                >
                  {pageNumber}
                </PaginationPage>
              );
            })}

            {props.pageCount > 4 && (
              <>
                {props.pageCount > 6 && <PaginationGap />}

                {props.pageCount === 5 && (
                  <PaginationPage
                    href={`${props.route}?page=${props.pageCount}${urlParams}`}
                    current={props.page === props.pageCount}
                  >
                    {props.pageCount}
                  </PaginationPage>
                )}

                {props.pageCount >= 6 &&
                  [props.pageCount - 1, props.pageCount].map((pageNumber) => (
                    <PaginationPage
                      key={pageNumber}
                      href={`${props.route}?page=${pageNumber}${urlParams}`}
                      current={pageNumber === props.page}
                    >
                      {pageNumber}
                    </PaginationPage>
                  ))}
              </>
            )}
          </PaginationList>

          <PaginationNext
            href={props.page !== props.pageCount ? `${props.route}?page=${props.page + 1}${urlParams}` : undefined}
          />
        </Pagination>
      )}
    </>
  );
}
