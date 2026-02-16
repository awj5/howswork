import type { RiskType } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";

type RiskProps = {
  data: RiskType;
  timezone: string;
};

export default function Risk(props: RiskProps) {
  return (
    <TableRow>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell>{props.data.description}</TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
}
