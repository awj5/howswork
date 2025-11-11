import { Sidebar, SidebarBody, SidebarFooter, SidebarItem, SidebarSection } from "@/components/sidebar";
import { Dropdown, DropdownButton, DropdownMenu } from "@/components/dropdown";
import SignOut from "./SignOut";

export default function Nav() {
  return (
    <Sidebar>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/">Dashboard</SidebarItem>
          <SidebarItem href="/reports">Reports</SidebarItem>
          <SidebarItem href="/checks">Checks</SidebarItem>
          <SidebarItem href="/users">Users</SidebarItem>
          <SidebarItem href="/settings">Settings</SidebarItem>
        </SidebarSection>
      </SidebarBody>

      <SidebarFooter className="max-lg:hidden">
        <Dropdown>
          <DropdownButton as={SidebarItem}>
            <span>Hello</span>
          </DropdownButton>

          <DropdownMenu className="min-w-64" anchor="top start">
            <SignOut />
          </DropdownMenu>
        </Dropdown>
      </SidebarFooter>
    </Sidebar>
  );
}
