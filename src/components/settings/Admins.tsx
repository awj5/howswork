"use client";

import { useEffect, useState } from "react";
import { EnvelopeIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { isValidEmail } from "@/utils/helpers";
import { useUserContext } from "@/hooks/useUserContext";
import type { UserType } from "@/types";
import { removeUser, inviteUser } from "@/app/(protected)/settings/actions-admins";
import { createClient } from "@/utils/supabase/client";
import { Subheading } from "@/components/heading";
import { Button } from "@/components/button";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { ErrorMessage, Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";

export default function Admins() {
  const supabase = createClient();
  const { user } = useUserContext();
  const companies = useCompanies();
  const [users, setUsers] = useState<UserType[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<UserType>();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteEmailError, setInviteEmailError] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const inviteClick = async () => {
    setInviteEmailError(false);

    if (!isValidEmail(inviteEmail)) {
      setInviteEmailError(true);
      return;
    }

    // Send
    setDisabled(true);
    const result = await inviteUser(inviteEmail, companies[0]);

    if (result.error) {
      toast.error(result.error);
      setDisabled(false);
      return;
    }

    // Success
    toast.success(result.success);
    setDisabled(false);
    setInviteEmail(""); // Reset
    setDialogOpen(false);
  };

  const removeUserClick = async () => {
    setAlertOpen(false);
    if (!userToRemove) return;
    setDisabled(true);
    const result = await removeUser(userToRemove, companies[0].id);

    if (result.error) {
      toast.error(result.error);
      setDisabled(false);
      return;
    }

    // Success
    toast.success(result.success);
    setDisabled(false);
    if (userToRemove.user_id === user?.user_id) window.location.reload(); // Refresh page if auth user
  };

  const confirmRemoveClick = (user: UserType) => {
    setUserToRemove(user);
    setAlertOpen(true);
  };

  useEffect(() => {
    const getUsers = async () => {
      // Get company users
      const { data: companyUsersData, error: companyUsersError } = await supabase
        .from("company_users")
        .select("user_id, invite_email")
        .eq("company_id", companies[0].id);

      if (companyUsersError) {
        console.error(companyUsersError);
        return;
      }

      const userIDs = companyUsersData.map((u) => u.user_id).filter(Boolean); // Registered user IDs
      const inviteEmails = companyUsersData.map((u) => u.invite_email).filter(Boolean); // Invited user emails

      // Get profiles (don't show super admins unless it's their company)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email")
        .in("user_id", userIDs)
        .or(`super_admin_company_id.is.null,super_admin_company_id.eq.${companies[0].id}`)
        .order("first_name", { ascending: true });

      if (profilesError) {
        console.error(profilesError);
        return;
      }

      // Add invited users to list
      const invitedUsers = inviteEmails.map((email) => ({
        user_id: "",
        first_name: "",
        last_name: "",
        email,
      }));

      setUsers([...profilesData, ...invitedUsers]); // Combine
    };

    if (companies.length && !disabled) getUsers();
  }, [companies, disabled]);

  return (
    <>
      {users.length ? (
        <>
          <div className="mt-8 flex items-end justify-between">
            <Subheading>Administrators</Subheading>

            <Button onClick={() => setDialogOpen(true)} color="indigo">
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
              {users.map((u) => (
                <TableRow key={u.email}>
                  <TableCell className={`font-medium ${!u.user_id && "text-zinc-500"}`}>
                    {u.user_id ? `${u.first_name} ${u.last_name}` : "Pending"}
                  </TableCell>

                  <TableCell className={`${!u.user_id && "text-zinc-500"}`}>{u.email}</TableCell>

                  <TableCell className="text-right">
                    <Button onClick={() => confirmRemoveClick(u)} disabled={disabled} outline>
                      <XCircleIcon />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : null}

      <Dialog open={dialogOpen} onClose={setDialogOpen}>
        <DialogTitle>Invite administrator</DialogTitle>

        <DialogDescription>
          We'll email this person an invite to join your dashboard as an admin. Only invite people you trust to have
          full access.
        </DialogDescription>

        <DialogBody>
          <Field>
            <Label>Email</Label>

            <Input
              type="email"
              name="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              invalid={inviteEmailError}
              disabled={disabled}
            />

            {inviteEmailError && <ErrorMessage>This field is required.</ErrorMessage>}
          </Field>
        </DialogBody>

        <DialogActions>
          <Button plain onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>

          <Button onClick={inviteClick} disabled={disabled} color="indigo">
            Invite
          </Button>
        </DialogActions>
      </Dialog>

      <Alert open={alertOpen} onClose={setAlertOpen}>
        <AlertTitle>
          Are you sure you want to remove{" "}
          {`${userToRemove?.user_id === user?.user_id ? "yourself" : "this administrator"}`}?
        </AlertTitle>

        <AlertDescription>
          {`${userToRemove?.user_id === user?.user_id ? "You" : !userToRemove?.user_id ? "They" : `${userToRemove?.first_name} ${userToRemove?.last_name}`}`}{" "}
          will no longer have access to the {companies[0]?.name} dashboard.
        </AlertDescription>

        <AlertActions>
          <Button plain onClick={() => setAlertOpen(false)}>
            Cancel
          </Button>

          <Button onClick={removeUserClick} color="red">
            Remove
          </Button>
        </AlertActions>
      </Alert>
    </>
  );
}
