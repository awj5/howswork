"use client";

import { usePathname } from "next/navigation";
import {
  HomeIcon,
  HandRaisedIcon,
  CheckCircleIcon,
  UsersIcon,
  Cog6ToothIcon,
  ClipboardIcon,
  LifebuoyIcon,
} from "@heroicons/react/20/solid";
import {
  Sidebar,
  SidebarBody,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import ConcernCount from "./nav/ConcernCount";
import Footer from "./nav/Footer";

export default function Nav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", Icon: HomeIcon },
    { href: "/assessments", label: "Assessments", Icon: CheckCircleIcon },
    { href: "/concerns", label: "Concerns", Icon: HandRaisedIcon },
    { href: "/risk-register", label: "Risk Register", Icon: ClipboardIcon },
    { href: "/people", label: "People", Icon: UsersIcon },
    { href: "/settings", label: "Settings", Icon: Cog6ToothIcon },
  ];

  return (
    <Sidebar>
      <SidebarBody>
        <div className="m-2 mb-4 w-fit">
          <Logo className="h-7" iconOnly />
        </div>

        <SidebarSection>
          {navItems.map(({ href, label, Icon }) => (
            <SidebarItem
              key={href}
              href={href}
              current={pathname === href || (href !== "/" && pathname.includes(href))}
            >
              <Icon />

              <span className="flex items-center gap-2">
                <SidebarLabel>{label}</SidebarLabel>
                {href === "/concerns" && <ConcernCount />}
              </span>
            </SidebarItem>
          ))}
        </SidebarSection>

        <SidebarSpacer />

        <SidebarSection>
          <SidebarItem href="mailto:support@howswork.app?subject=Dashboard support request">
            <LifebuoyIcon />
            <SidebarLabel>Contact Support</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>

      <Footer />
    </Sidebar>
  );
}
