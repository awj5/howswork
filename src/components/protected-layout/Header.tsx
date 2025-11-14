"use client";

import { useUserContext } from "@/hooks/useUserContext";
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "@/components/navbar";
import { Dropdown, DropdownButton, DropdownMenu } from "@/components/dropdown";
import { Avatar } from "../avatar";
import AccountMenu from "./AccountMenu";

export default function Header() {
  const { user } = useUserContext();

  return (
    <Navbar>
      <NavbarSpacer />

      <NavbarSection>
        <Dropdown>
          <DropdownButton as={NavbarItem}>
            <Avatar
              initials={
                user?.firstName && user?.lastName
                  ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                  : user?.email.charAt(0)
              }
              square
            />
          </DropdownButton>

          <DropdownMenu className="min-w-64" anchor="bottom end">
            <AccountMenu />
          </DropdownMenu>
        </Dropdown>
      </NavbarSection>
    </Navbar>
  );
}
