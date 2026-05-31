"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRightStartOnRectangleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/16/solid";
import { createClient } from "@/utils/supabase/client";
import { DropdownDivider, DropdownItem, DropdownLabel } from "@/components/ui/dropdown";

export default function AccountMenu() {
  const router = useRouter();

  const signOutClick = async () => {
    const supabase = createClient();
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

      <DropdownItem href="https://articles.howswork.app/" target="_blank">
        <ArrowTopRightOnSquareIcon />
        <DropdownLabel>Resources</DropdownLabel>
      </DropdownItem>

      <DropdownItem href="https://articles.howswork.app/privacy-policy/" target="_blank">
        <ShieldCheckIcon />
        <DropdownLabel>Privacy policy</DropdownLabel>
      </DropdownItem>

      <DropdownItem href="https://howswork.app/articles/terms-of-use/" target="_blank">
        <DocumentTextIcon />
        <DropdownLabel>Terms of use</DropdownLabel>
      </DropdownItem>

      <DropdownDivider />

      <DropdownItem onClick={signOutClick}>
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>Sign out</DropdownLabel>
      </DropdownItem>
    </>
  );
}
