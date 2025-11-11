import { useContext } from "react";
import { AdminUserContext } from "@/context/admin-user";
import { SidebarFooter, SidebarItem } from "@/components/sidebar";
import { Dropdown, DropdownButton, DropdownMenu } from "@/components/dropdown";
import SignOut from "../SignOut";

export default function Footer() {
  const user = useContext(AdminUserContext);

  return (
    <SidebarFooter className="max-lg:hidden">
      <Dropdown>
        <DropdownButton as={SidebarItem}>
          <span>{user?.email}</span>
        </DropdownButton>

        <DropdownMenu className="min-w-64" anchor="top start">
          <SignOut />
        </DropdownMenu>
      </Dropdown>
    </SidebarFooter>
  );
}
