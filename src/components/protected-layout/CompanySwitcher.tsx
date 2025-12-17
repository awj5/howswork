import { BuildingOffice2Icon } from "@heroicons/react/16/solid";
import { useCompanies } from "@/hooks/useCompanies";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/ui/listbox";

export default function CompanySwitcher() {
  const companies = useCompanies();

  const changeCompany = (id: number) => {
    localStorage.setItem("company", String(id)); // Store locally as string
    window.location.reload(); // Refresh page
  };

  return (
    <>
      {companies.length > 1 && (
        <Listbox defaultValue={companies[0].id} onChange={(e) => changeCompany(e)} aria-label="Company switcher">
          {companies.map((c) => (
            <ListboxOption key={c.id} value={c.id}>
              <BuildingOffice2Icon />
              <ListboxLabel>{c.name}</ListboxLabel>
            </ListboxOption>
          ))}
        </Listbox>
      )}
    </>
  );
}
