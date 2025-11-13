import { useContext } from "react";
import { UserContext } from "@/context/user";
import { SidebarFooter, SidebarItem } from "@/components/sidebar";
import { Dropdown, DropdownButton, DropdownMenu } from "@/components/dropdown";
import { Avatar } from "@/components/avatar";
import AccountMenu from "../AccountMenu";

export default function Footer() {
  const user = useContext(UserContext);

  return (
    <SidebarFooter className="max-lg:hidden">
      <Dropdown>
        <DropdownButton as={SidebarItem}>
          <span className="flex min-w-0 items-center gap-3">
            <Avatar
              initials={
                user?.firstName && user?.lastName
                  ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                  : user?.email.charAt(0)
              }
              className="size-10"
              square
              alt=""
            />

            <span className="min-w-0">
              <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                {user?.firstName}
              </span>

              <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                {user?.email}
              </span>
            </span>
          </span>
        </DropdownButton>

        <DropdownMenu className="min-w-64" anchor="top start">
          <AccountMenu />
        </DropdownMenu>
      </Dropdown>
    </SidebarFooter>
  );
}
