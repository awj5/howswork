"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRightStartOnRectangleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from "@heroicons/react/16/solid";
import { createClient } from "@/utils/supabase/client";
import { DropdownDivider, DropdownItem, DropdownLabel } from "@/components/dropdown";

export default function AccountMenu() {
  const router = useRouter();
  const supabase = createClient();

  const signOutClick = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <DropdownItem href="/account">
        <UserCircleIcon />
        <DropdownLabel>My account</DropdownLabel>
      </DropdownItem>

      <DropdownDivider />

      <DropdownItem href="/privacy">
        <ShieldCheckIcon />
        <DropdownLabel>Privacy policy</DropdownLabel>
      </DropdownItem>

      <DropdownItem href="/feedback">
        <LightBulbIcon />
        <DropdownLabel>Share feedback</DropdownLabel>
      </DropdownItem>

      <DropdownDivider />

      <DropdownItem onClick={signOutClick}>
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>Sign out</DropdownLabel>
      </DropdownItem>
    </>
  );
}
