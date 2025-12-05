import { Heading } from "@/components/heading";
import Admins from "@/components/people/Admins";
import Employees from "@/components/people/Employees";

export default function People() {
  return (
    <div className="mx-auto max-w-4xl">
      <Heading>People</Heading>
      <Admins />
      <Employees />
    </div>
  );
}
