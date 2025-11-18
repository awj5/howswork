"use client";

import { EnvelopeIcon } from "@heroicons/react/16/solid";
import { createClient } from "@/utils/supabase/client";
import { Heading, Subheading } from "@/components/heading";
import { Button } from "@/components/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { useEffect } from "react";

export default function Settings() {
  const users = [{ handle: "hello", name: "Adam", email: "adam@", access: "admin" }];

  const test = async () => {
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) throw new Error("Unauthenticated");

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("first_name, last_name, company_id");
    //.eq("user_id", authData.user.id)
    //.single();

    if (profilesError) throw profilesError;

    console.log(profilesData);
  };

  useEffect(() => {
    test();
  }, []);

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
