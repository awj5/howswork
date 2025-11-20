import { Heading } from "@/components/heading";
import Admins from "@/components/settings/Admins";

export default function Settings() {
  return (
    <div className="mx-auto max-w-4xl">
      <Heading>Settings</Heading>
      <Admins />
    </div>
  );
}
