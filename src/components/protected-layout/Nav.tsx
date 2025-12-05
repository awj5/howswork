"use client";

import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  Cog6ToothIcon,
  ClipboardIcon,
  LifebuoyIcon,
} from "@heroicons/react/20/solid";
import { Sidebar, SidebarBody, SidebarItem, SidebarLabel, SidebarSection, SidebarSpacer } from "@/components/sidebar";
import { Link } from "@/components/link";
import { Logo } from "@/components/Logo";
import Footer from "./nav/Footer";

export default function Nav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", Icon: HomeIcon },
    { href: "/pulse-checks", label: "Pulse Checks", Icon: CheckCircleIcon },
    { href: "/concerns", label: "Concerns", Icon: ExclamationTriangleIcon },
    { href: "/risk-register", label: "Risk Register", Icon: ClipboardIcon },
    { href: "/people", label: "People", Icon: UsersIcon },
    { href: "/settings", label: "Settings", Icon: Cog6ToothIcon },
  ];

  return (
    <Sidebar>
      <SidebarBody>
        <div className="m-2 mb-4 w-fit">
          <Link href="/" aria-label="Dashboard">
            <Logo className="h-7" iconOnly />
          </Link>
        </div>

        <SidebarSection>
          {navItems.map(({ href, label, Icon }) => (
            <SidebarItem key={href} href={href} current={pathname === href}>
              <Icon />
              <SidebarLabel>{label}</SidebarLabel>
            </SidebarItem>
          ))}
        </SidebarSection>

        <SidebarSpacer />

        <SidebarSection>
          <SidebarItem href="mailto:support@howswork.app?subject=Dashboard Support Request">
            <LifebuoyIcon />
            <SidebarLabel>Contact Support</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>

      <Footer />
    </Sidebar>
  );
}
