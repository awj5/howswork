import { useEffect } from "react";
import { BuildingOffice2Icon } from "@heroicons/react/16/solid";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/listbox";

export default function CompanySwitcher() {
  useEffect(() => {
    async function getCompanies() {
      //
    }

    getCompanies();
  }, []);

  return (
    <Listbox name="status" defaultValue="active" aria-label="Project status">
      <ListboxOption value="active">
        <BuildingOffice2Icon />
        <ListboxLabel>HowsWork</ListboxLabel>
      </ListboxOption>
    </Listbox>
  );
}
