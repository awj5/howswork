import { useUserContext } from "@/hooks/useUserContext";
import { SidebarFooter, SidebarItem } from "@/components/ui/sidebar";
import { Dropdown, DropdownButton, DropdownMenu } from "@/components/ui/dropdown";
import { Avatar } from "@/components/ui/avatar";
import AccountMenu from "../AccountMenu";
import CompanySwitcher from "../CompanySwitcher";

export default function Footer() {
  const { user } = useUserContext();

  const initials =
    user?.first_name && user?.last_name
      ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
      : user?.email.charAt(0);

  return (
    <SidebarFooter className="gap-4 max-lg:hidden">
      <CompanySwitcher />

      <Dropdown>
        <DropdownButton as={SidebarItem}>
          <span className="flex min-w-0 items-center gap-3">
            <Avatar initials={initials} className="size-10" square alt={initials} />

            <span className="min-w-0">
              <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                {user?.first_name}
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
