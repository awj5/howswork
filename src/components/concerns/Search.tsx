import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { Input, InputGroup } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function Search() {
  return (
    <div className="mt-4 flex max-w-xl gap-4">
      <div className="flex-1">
        <InputGroup>
          <MagnifyingGlassIcon />
          <Input placeholder="Search concerns&hellip;" aria-label="Search concerns" />
        </InputGroup>
      </div>

      <div>
        <Select name="status">
          <option value="all">All concerns</option>
          <option value="needs_attention">Needs attention</option>
          <option value="in_progress">In progress</option>
          <option value="closed">Closed</option>
        </Select>
      </div>
    </div>
  );
}
