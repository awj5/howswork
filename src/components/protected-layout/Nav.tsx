"use client";

import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/20/solid";
import { Sidebar, SidebarBody, SidebarItem, SidebarLabel, SidebarSection, SidebarSpacer } from "@/components/sidebar";
import { Link } from "@/components/link";
import { Logo } from "@/components/Logo";
import Footer from "./nav/Footer";

export default function Nav() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarBody>
        <div className="m-2 mb-4">
          <Link href="/" aria-label="Dashboard">
            <Logo className="h-8" iconOnly />
          </Link>
        </div>

        <SidebarSection>
          <SidebarItem href="/" current={pathname === "/"}>
            <HomeIcon />
            <SidebarLabel>Dashboard</SidebarLabel>
          </SidebarItem>

          <SidebarItem href="/reports" current={pathname === "/reports"}>
            <DocumentChartBarIcon />
            <SidebarLabel>Risk Reports</SidebarLabel>
          </SidebarItem>

          <SidebarItem href="/incidents" current={pathname === "/incidents"}>
            <ExclamationTriangleIcon />
            <SidebarLabel>Incidents & Concerns</SidebarLabel>
          </SidebarItem>

          <SidebarItem href="/check-ins" current={pathname === "/check-ins"}>
            <CheckCircleIcon />
            <SidebarLabel>Check-Ins</SidebarLabel>
          </SidebarItem>

          <SidebarItem href="/teams" current={pathname === "/teams"}>
            <UsersIcon />
            <SidebarLabel>Teams</SidebarLabel>
          </SidebarItem>

          <SidebarItem href="/settings" current={pathname === "/settings"}>
            <Cog6ToothIcon />
            <SidebarLabel>Settings</SidebarLabel>
          </SidebarItem>
        </SidebarSection>

        <SidebarSpacer />

        <SidebarSection>
          <SidebarItem href="mailto:support@moodcheck.co?subject=Dashboard Support Request">
            <QuestionMarkCircleIcon />
            <SidebarLabel>Support</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>

      <Footer />
    </Sidebar>
  );
}
