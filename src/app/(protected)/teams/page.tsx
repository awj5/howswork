import { EllipsisHorizontalIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/16/solid";
import { Input, InputGroup } from "@/components/input";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from "@/components/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";

export default function Teams() {
  /*const teams = [
    { id: 1, name: "Team 1", count: 12 },
    { id: 2, name: "Team 2", count: 8 },
    { id: 3, name: "Team 3", count: 10 },
    { id: 4, name: "Team 4", count: 22 },
    { id: 5, name: "Team 5", count: 31 },
    { id: 6, name: "Team 6", count: 15 },
    { id: 7, name: "Team 7", count: 5 },
    { id: 8, name: "Team 8", count: 33 },
    { id: 9, name: "Team 9", count: 8 },
    { id: 10, name: "Team 10", count: 9 },
  ];*/

  return (
    <>
      {/*<div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>Teams</Heading>

          <div className="mt-4 flex max-w-sm">
            <div className="flex-1">
              <InputGroup>
                <MagnifyingGlassIcon />
                <Input name="search" placeholder="Search teams&hellip;" aria-label="Search" />
              </InputGroup>
            </div>
          </div>
        </div>

        <Button color="indigo">
          <PlusIcon />
          Create team
        </Button>
      </div>

      <Table className="mt-8 [--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Members</TableHeader>

            <TableHeader className="relative w-0">
              <span className="sr-only">Actions</span>
            </TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {teams.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.name}</TableCell>
              <TableCell>{t.count}</TableCell>

              <TableCell className="text-right">
                <Dropdown>
                  <DropdownButton plain aria-label="More options">
                    <EllipsisHorizontalIcon />
                  </DropdownButton>

                  <DropdownMenu anchor="bottom end">
                    <DropdownItem>View</DropdownItem>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination className="mt-6">
        <PaginationPrevious href="?page=1" />

        <PaginationList>
          <PaginationPage href="?page=1">1</PaginationPage>
          <PaginationGap />
          <PaginationPage href="?page=2">2</PaginationPage>
        </PaginationList>

        <PaginationNext href="?page=2" />
      </Pagination>
    </div>*/}
    </>
  );
}
