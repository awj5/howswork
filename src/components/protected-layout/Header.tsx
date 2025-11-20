"use client";

import { useUserContext } from "@/hooks/useUserContext";
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "@/components/navbar";
import { Dropdown, DropdownButton, DropdownMenu } from "@/components/dropdown";
import { Avatar } from "@/components/avatar";
import AccountMenu from "./AccountMenu";
import CompanySwitcher from "./CompanySwitcher";

export default function Header() {
  const { user } = useUserContext();

  return (
    <Navbar>
      <NavbarSpacer />

      <NavbarSection>
        <CompanySwitcher />

        <Dropdown>
          <DropdownButton as={NavbarItem}>
            <Avatar
              initials={
                user?.first_name && user?.last_name
                  ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
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
