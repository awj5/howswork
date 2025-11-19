"use client";

import { EnvelopeIcon } from "@heroicons/react/16/solid";
import { Heading, Subheading } from "@/components/heading";
import { Button } from "@/components/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";

export default function Settings() {
  const users = [{ handle: "hello", name: "Adam", email: "adam@", access: "admin" }];

  return (
    <div className="mx-auto max-w-4xl">
      <Heading>Settings</Heading>

      <div className="mt-8 flex items-end justify-between">
        <Subheading>Administrators</Subheading>

        <Button outline>
          <EnvelopeIcon />
          Invite admin
        </Button>
      </div>

      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user.handle}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Button plain>Remove</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
