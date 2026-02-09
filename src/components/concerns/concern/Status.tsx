import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import StatusData from "@/data/status.json";
import { addStatus } from "@/app/(protected)/concerns/[id]/actions";
import { useCompanies } from "@/hooks/useCompanies";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/ui/listbox";

type StatusProps = {
  concernID: number;
  val: number;
  setVal: Dispatch<SetStateAction<number>>;
  disabled: boolean;
  setDisabled: Dispatch<SetStateAction<boolean>>;
};

export default function Status(props: StatusProps) {
  const companies = useCompanies();

  const changeStatus = async (id: number) => {
    if (!companies.length || id === props.val) return;
    props.setDisabled(true);
    const result = await addStatus(props.concernID, id, companies[0].id);

    if (result.error) {
      toast.error(result.error);
      props.setDisabled(false);
      return;
    }

    // Success
    toast.success("Status updated");
    props.setVal(id);
  };

  return (
    <Listbox
      value={props.val > 1 ? props.val : null}
      placeholder="Update status"
      onChange={(e) => e && changeStatus(e)}
      aria-label="Update status"
      className="min-w-0 sm:max-w-40"
      disabled={props.disabled}
    >
      {StatusData.slice(2).map((status) => (
        <ListboxOption key={status.id} value={status.id}>
          <ListboxLabel>{status.title}</ListboxLabel>
        </ListboxOption>
      ))}
    </Listbox>
  );
}
