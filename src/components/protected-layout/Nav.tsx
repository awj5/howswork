"use client";

import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/20/solid";
import { Sidebar, SidebarBody, SidebarFooter, SidebarItem, SidebarLabel, SidebarSection } from "@/components/sidebar";
import { Dropdown, DropdownButton, DropdownMenu } from "@/components/dropdown";
import { Link } from "@/components/link";
import { Logo } from "@/components/Logo";
import SignOut from "./SignOut";

export default function Nav() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarBody>
        <div className="m-2">
          <Link href="/" aria-label="Dashboard">
            <Logo className="h-8" />
          </Link>
        </div>

        <SidebarSection>
          <SidebarItem href="/" current={pathname === "/"}>
            <HomeIcon />
            <SidebarLabel>Dashboard</SidebarLabel>
          </SidebarItem>

          <SidebarItem href="/" current={pathname === "/reports"}>
            <DocumentChartBarIcon />
            <SidebarLabel>Reports</SidebarLabel>
          </SidebarItem>

          <SidebarItem href="/" current={pathname === "/hazards"}>
            <ExclamationTriangleIcon />
            <SidebarLabel>Hazards & Incidents</SidebarLabel>
          </SidebarItem>

          <SidebarItem href="/" current={pathname === "/check-ins"}>
            <CheckCircleIcon />
            <SidebarLabel>Check-Ins</SidebarLabel>
          </SidebarItem>

          <SidebarItem href="/people" current={pathname === "/people"}>
            <UsersIcon />
            <SidebarLabel>People</SidebarLabel>
          </SidebarItem>

          <SidebarItem href="/settings" current={pathname === "/settings"}>
            <Cog6ToothIcon />
            <SidebarLabel>Settings</SidebarLabel>
          </SidebarItem>
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
