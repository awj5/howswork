"use client";

import { useEffect, useState } from "react";
import { EnvelopeIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { toast } from "sonner";
import { useCompany } from "@/hooks/useCompany";
import { isValidEmail } from "@/utils/helpers";
import { useUserContext } from "@/hooks/useUserContext";
import type { UserType } from "@/types";
import { removeUser, inviteUser } from "@/app/(protected)/settings/actions";
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
  const company = useCompany();
  const [refreshUsers, setRefreshUsers] = useState(false);
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
    if (!company) return;
    setDisabled(true);
    setRefreshUsers(false);
    const result = await inviteUser(inviteEmail, company);

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
    setRefreshUsers(true); // Add to list if user already exists
  };

  const removeUserClick = async () => {
    setAlertOpen(false);
    setRefreshUsers(false);
    if (!userToRemove || !company) return;
    const result = await removeUser(userToRemove, company.id);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setRefreshUsers(true); // Remove from list
    if (userToRemove.user_id === user?.user_id) window.location.reload(); // Refresh page if auth user
  };

  const confirmRemoveClick = (user: UserType) => {
    setUserToRemove(user);
    setAlertOpen(true);
  };

  useEffect(() => {
    async function getUsers() {
      // Get company users
      const { data: companyUsersData, error: companyUsersError } = await supabase
        .from("company_users")
        .select("user_id, invite_email")
        .eq("company_id", company?.id);

      if (companyUsersError) {
        console.error(companyUsersError);
        return;
      }

      const userIDs = companyUsersData.map((row) => row.user_id).filter(Boolean); // Registered users in company
      let allUsers: UserType[] = [];

      // Get profiles (don't show super admins unless it's their company)
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

      allUsers = profilesData;
      const inviteEmails = companyUsersData.map((row) => row.invite_email).filter(Boolean); // Invited users

      // Add invited users to list
      const invitedUsers = inviteEmails.map((email) => ({
        user_id: "",
        first_name: "",
        last_name: "",
        email,
      }));

      setUsers([...allUsers, ...invitedUsers]); // Combine registered and invited
    }

    if (company) getUsers();
  }, [company, refreshUsers]);

  return (
    <>
      {users.length ? (
        <>
          <div className="mt-8 flex items-end justify-between">
            <Subheading>Administrators</Subheading>

            <Button onClick={() => setDialogOpen(true)} outline>
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
              {users.map((item) => (
                <TableRow key={item.email}>
                  <TableCell className={`font-medium ${!item.user_id && "text-zinc-500"}`}>
                    {item.user_id ? `${item.first_name} ${item.last_name}` : "Pending"}
                  </TableCell>

                  <TableCell className={`${!item.user_id && "text-zinc-500"}`}>{item.email}</TableCell>

                  <TableCell className="text-right">
                    <Button onClick={() => confirmRemoveClick(item)} plain>
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
          We'll email this person an invite to join your HowsWork dashboard as an admin. Only invite people you trust to
          have full access.
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

          <Button onClick={inviteClick} disabled={disabled}>
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
          will no longer have access to the HowsWork dashboard for {company?.name}.
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
