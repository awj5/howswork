import Image from "next/image";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/16/solid";
import SentimentsData from "@/data/sentiments.json";
import { CheckInStatType } from "@/types";
import { Divider } from "@/components/ui/divider";
import { Badge } from "@/components/ui/badge";

type StatProps = {
  data: CheckInStatType;
};

export default function Stat(props: StatProps) {
  const trend = props.data.secondary > 0 ? "up" : "down";
  const sentimentIndex = Math.max(0, Math.floor((props.data.primary - 1) / (100 / SentimentsData.length))); // eg. 0-20 = 0, 81-100 = 4
  const sentiment = props.data.sentiment ? SentimentsData[sentimentIndex] : undefined;

  return (
    <div>
      <Divider />
      <div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{props.data.title}</div>

      <div className="mt-3 flex gap-2">
        {sentiment && props.data.primary ? (
          <Image
            src={`/img/emoji-${sentiment.id}.svg`}
            width={96}
            height={96}
            alt={sentiment.label}
            aria-hidden="true"
            className="size-8 sm:size-7"
          />
        ) : null}

        <div className="text-3xl/8 font-semibold sm:text-2xl/8">
          {!props.data.percentage || props.data.primary ? props.data.primary : "—"}
          {props.data.percentage && props.data.primary ? "%" : null}
        </div>
      </div>

      {props.data.secondary && (!props.data.percentage || props.data.primary) ? (
        <div className="mt-3 flex items-center gap-1">
          {!props.data.percentage ? (
            <Badge>
              {trend === "up" && "+"}
              {props.data.secondary}%
            </Badge>
          ) : trend === "up" ? (
            <ArrowTrendingUpIcon className="size-7 text-green-500 sm:size-6" />
          ) : (
            <ArrowTrendingDownIcon className="size-7 text-red-500 sm:size-6" />
          )}

          <span className="text-sm/6 text-zinc-500 sm:text-xs/6">from last check-in</span>
        </div>
      ) : null}
    </div>
  );
}
