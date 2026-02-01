import { ConcernActivityType } from "@/types";
import Event from "./activity/Event";

type ActivityProps = {
  date: string;
  data: ConcernActivityType[] | undefined;
};

export default function Activity(props: ActivityProps) {
  return (
    <div className="relative mt-4">
      <span aria-hidden="true" className="absolute top-0 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-white/10" />

      <div className="relative flex flex-col gap-8">
        {props.data?.map((event) => (
          <Event key={event.created_at} data={event} />
        ))}

        <Event data={{ created_at: props.date, status: 0 }} />
      </div>
    </div>
  );
}
