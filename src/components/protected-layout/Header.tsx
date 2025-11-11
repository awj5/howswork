import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "@/components/navbar";
import { Dropdown, DropdownButton, DropdownMenu } from "@/components/dropdown";
import SignOut from "./SignOut";

export default function Header() {
  return (
    <Navbar>
      <NavbarSpacer />

      <NavbarSection>
        <Dropdown>
          <DropdownButton as={NavbarItem}>
            <span>Hello</span>
          </DropdownButton>

          <DropdownMenu className="min-w-64" anchor="bottom end">
            <SignOut />
          </DropdownMenu>
        </Dropdown>
      </NavbarSection>
    </Navbar>
  );
}
