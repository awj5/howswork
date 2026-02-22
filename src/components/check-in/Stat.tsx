import Image from "next/image";
import SentimentsData from "@/data/sentiments.json";
import { CheckInStatType } from "@/types";
import { Divider } from "@/components/ui/divider";
import { Badge } from "@/components/ui/badge";

type StatProps = {
  data: CheckInStatType;
  status: number;
};

export default function Stat(props: StatProps) {
  const trend = props.data.secondary > 0 ? "up" : "down";
  const showData = props.data.primaryText && props.status !== 1;
  const sentimentIndex = Math.max(0, Math.floor((props.data.primary - 1) / (100 / SentimentsData.length))); // eg. 0-20 = 0, 81-100 = 4
  const sentiment =
    props.data.title === "Sentiment score" && props.data.primary ? SentimentsData[sentimentIndex] : undefined;

  return (
    <div>
      <Divider />
      <div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{props.data.title}</div>

      <div className="mt-3 flex gap-3">
        {sentiment && (
          <Image
            src={`/img/emoji-${sentiment.id}.svg`}
            width={96}
            height={96}
            alt={sentiment.label}
            aria-hidden="true"
            className="size-8 sm:size-7"
          />
        )}

        <div className={`text-3xl/8 font-semibold ${!showData && "text-zinc-500 dark:text-zinc-400"} sm:text-2xl/8`}>
          {showData ? props.data.primaryText : "—"}
        </div>
      </div>

      {!!(showData && props.data.secondary) && (
        <div className="mt-3 flex items-center gap-1">
          <Badge color={props.data.title === "Concerns raised" ? "zinc" : trend === "up" ? "green" : "red"}>
            {trend === "up" && "+"}
            {props.data.secondary}%
          </Badge>
          <span className="text-sm/6 text-zinc-500 sm:text-xs/6 dark:text-zinc-400">from last check-in</span>
        </div>
      )}
    </div>
  );
}
