"use client";

import { useContext } from "react";
import { UserContext } from "@/context/user";
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "@/components/navbar";
import { Dropdown, DropdownButton, DropdownMenu } from "@/components/dropdown";
import SignOut from "./SignOut";

export default function Header() {
  const user = useContext(UserContext);

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
