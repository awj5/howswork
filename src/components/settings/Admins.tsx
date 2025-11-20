"use client";

import { useEffect, useState } from "react";
import { EnvelopeIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { toast } from "sonner";
import { useCompany } from "@/hooks/useCompany";
import type { UserType } from "@/types";
import { removeUser } from "@/app/(protected)/settings/actions";
import { createClient } from "@/utils/supabase/client";
import { Subheading } from "@/components/heading";
import { Button } from "@/components/button";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { useUserContext } from "@/hooks/useUserContext";

export default function Admins() {
  const supabase = createClient();
  const { user } = useUserContext();
  const company = useCompany();
  const [users, setUsers] = useState<UserType[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [userToRemove, setUserToRemove] = useState<UserType>();

  const removeClick = async () => {
    setConfirmDelete(false);

    if (userToRemove && company) {
      const result = await removeUser(userToRemove.user_id, company.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setUsers((prev) => prev.filter((u) => u.user_id !== userToRemove.user_id)); // Remove from list
      if (userToRemove.user_id === user?.user_id) window.location.reload(); // Refresh page if auth user
    }
  };

  const confirmRemoveClick = (user: UserType) => {
    setUserToRemove(user);
    setConfirmDelete(true);
  };

  useEffect(() => {
    async function getUsers() {
      // Get company users
      const { data: companyUsersData, error: companyUsersError } = await supabase
        .from("company_users")
        .select("user_id")
        .eq("company_id", company?.id);

      if (companyUsersError) {
        console.error(companyUsersError);
        return;
      }

      const userIDs = companyUsersData.map((row) => row.user_id);

      // Get profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email")
        .in("user_id", userIDs)
        .or(`super_admin_company_id.is.null,super_admin_company_id.eq.${company?.id}`)
        .order("first_name", { ascending: true });

      if (profilesError) {
        console.error(profilesError);
        return;
      }

      setUsers(profilesData);
    }

    if (company) getUsers();
  }, [company]);

  return (
    <>
      {company && (
        <>
          <div className="mt-8 flex items-end justify-between">
            <Subheading>Administrators</Subheading>

            <Button outline>
              <EnvelopeIcon />
              Invite admin
            </Button>
          </div>

          <Table className="mt-4 [--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>

                <TableHeader className="relative w-0">
                  <span className="sr-only">Actions</span>
                </TableHeader>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">
                    {user?.first_name} {user?.last_name}
                  </TableCell>

                  <TableCell>{user?.email}</TableCell>

                  <TableCell className="text-right">
                    <Button onClick={() => confirmRemoveClick(user)} plain>
                      <XCircleIcon />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      <Alert open={confirmDelete} onClose={setConfirmDelete}>
        <AlertTitle>
          Are you sure you want to remove{" "}
          {`${userToRemove?.user_id === user?.user_id ? "yourself" : "this administrator"}`}?
        </AlertTitle>

        <AlertDescription>
          {`${userToRemove?.user_id === user?.user_id ? "You" : `${userToRemove?.first_name} ${userToRemove?.last_name}`}`}{" "}
          will no longer have access to the MoodCheck dashboard for {company?.name}.
        </AlertDescription>

        <AlertActions>
          <Button plain onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>

          <Button onClick={removeClick} color="red">
            Remove
          </Button>
        </AlertActions>
      </Alert>
    </>
  );
}
