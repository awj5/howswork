"use client";

import { useContext } from "react";
import { AdminUserContext } from "@/context/admin-user";
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "@/components/navbar";
import { Dropdown, DropdownButton, DropdownMenu } from "@/components/dropdown";
import SignOut from "./SignOut";

export default function Header() {
  const user = useContext(AdminUserContext);

  return (
    <Navbar>
      <NavbarSpacer />

      <NavbarSection>
        <Dropdown>
          <DropdownButton as={NavbarItem}>
            <span>{user?.email}</span>
          </DropdownButton>

          <DropdownMenu className="min-w-64" anchor="bottom end">
            <SignOut />
          </DropdownMenu>
        </Dropdown>
      </NavbarSection>
    </Navbar>
  );
}
