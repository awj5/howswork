import { BuildingOffice2Icon } from "@heroicons/react/16/solid";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/listbox";

export default function CompanySwitcher() {
  return (
    <Listbox name="status" defaultValue="active" aria-label="Project status">
      <ListboxOption value="active">
        <BuildingOffice2Icon />
        <ListboxLabel>MOOD PLATFORMS</ListboxLabel>
      </ListboxOption>
    </Listbox>
  );
}
