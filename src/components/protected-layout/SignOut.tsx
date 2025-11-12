"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { DropdownItem, DropdownLabel } from "@/components/dropdown";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/16/solid";

export default function SignOut() {
  const router = useRouter();
  const supabase = createClient();

  const click = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <DropdownItem onClick={click}>
      <ArrowRightStartOnRectangleIcon />
      <DropdownLabel>Sign out</DropdownLabel>
    </DropdownItem>
  );
}
