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

  const nav = [
    { href: "/", label: "Dashboard", Icon: HomeIcon },
    { href: "/reports", label: "Risk Reports", Icon: DocumentChartBarIcon },
    { href: "/incidents", label: "Incidents", Icon: ExclamationTriangleIcon },
    { href: "/check-ins", label: "Check-Ins", Icon: CheckCircleIcon },
    { href: "/teams", label: "Teams", Icon: UsersIcon },
    { href: "/settings", label: "Settings", Icon: Cog6ToothIcon },
  ];

  return (
    <Sidebar>
      <SidebarBody>
        <div className="m-2 mb-4">
          <Link href="/" aria-label="Dashboard">
            <Logo className="h-8" />
          </Link>
        </div>

        <SidebarSection>
          {nav.map(({ href, label, Icon }) => (
            <SidebarItem key={href} href={href} current={pathname === href}>
              <Icon />
              <SidebarLabel>{label}</SidebarLabel>
            </SidebarItem>
          ))}
        </SidebarSection>

        <SidebarSpacer />

        <SidebarSection>
          <SidebarItem href="mailto:support@psychsignal.work?subject=Dashboard Support Request">
            <QuestionMarkCircleIcon />
            <SidebarLabel>Support</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>

      <Footer />
    </Sidebar>
  );
}
