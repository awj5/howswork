import { Sidebar, SidebarBody, SidebarItem, SidebarSection } from "@/components/sidebar";

export default function Nav() {
  return (
    <Sidebar>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/">Dashboard</SidebarItem>
          <SidebarItem href="/reports">Reports</SidebarItem>
          <SidebarItem href="/users">Users</SidebarItem>
          <SidebarItem href="/settings">Settings</SidebarItem>
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  );
}
