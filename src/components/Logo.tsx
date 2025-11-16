import Image from "next/image";
import clsx from "clsx";

type LogoProps = {
  className?: string;
};

export function Logo(props: LogoProps) {
  return (
    <>
      <Image
        src="/img/icon.svg"
        width={128}
        height={128}
        alt="PsychSignal"
        className={clsx("inline w-auto dark:hidden", props.className)}
        priority
      />

      <Image
        src="/img/icon-dark.svg"
        width={128}
        height={128}
        alt="PsychSignal"
        className={clsx("hidden w-auto dark:inline", props.className)}
        priority
      />
    </>
  );
}
