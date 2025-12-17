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
};

export function TablePagination(props: TablePaginationProps) {
  return (
    <>
      {props.pageCount > 1 && (
        <Pagination className="mt-6">
          <PaginationPrevious href={props.page !== 1 ? `${props.route}?page=${props.page - 1}` : undefined} />

          <PaginationList>
            {Array.from({ length: Math.min(4, props.pageCount) }, (_, i) => {
              const pageNumber = i + 1;

              return (
                <PaginationPage
                  key={pageNumber}
                  href={`${props.route}?page=${pageNumber}`}
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
                    href={`${props.route}?page=${props.pageCount}`}
                    current={props.page === props.pageCount}
                  >
                    {props.pageCount}
                  </PaginationPage>
                )}

                {props.pageCount >= 6 &&
                  [props.pageCount - 1, props.pageCount].map((pageNumber) => (
                    <PaginationPage
                      key={pageNumber}
                      href={`${props.route}?page=${pageNumber}`}
                      current={pageNumber === props.page}
                    >
                      {pageNumber}
                    </PaginationPage>
                  ))}
              </>
            )}
          </PaginationList>

          <PaginationNext href={props.page !== props.pageCount ? `${props.route}?page=${props.page + 1}` : undefined} />
        </Pagination>
      )}
    </>
  );
}
