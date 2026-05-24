import { Subheading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

type FeedbackProps = {
  data: string[] | undefined;
  status: number;
};

export default function Feedback(props: FeedbackProps) {
  return (
    <div className="mt-12">
      <Subheading>Feedback{props.data?.length ? ` (${props.data.length})` : ""}</Subheading>

      <div className="mt-4 flow-root">
        {props.data?.length ? (
          <div className="-mt-8 sm:-mx-4 sm:columns-2 sm:text-[0] lg:columns-3">
            {props.data?.map((detail, index) => (
              <div key={index} className="pt-8 sm:inline-block sm:w-full sm:px-4">
                <figure className="rounded-2xl bg-gray-50 p-8 text-sm/6 dark:bg-white/2.5">
                  <blockquote className="text-gray-900 dark:text-gray-100">
                    <Text>{`“${detail}”`}</Text>
                  </blockquote>
                </figure>
              </div>
            ))}
          </div>
        ) : (
          <Text>{props.status !== 1 ? "No feedback shared" : "N/A"}</Text>
        )}
      </div>
    </div>
  );
}
