import Image from "next/image";
import clsx from "clsx";

type LogoProps = {
  className?: string;
  iconOnly?: boolean;
};

export function Logo(props: LogoProps) {
  return (
    <>
      {props.iconOnly ? (
        <>
          <Image
            src="/img/icon.svg"
            width={256}
            height={256}
            alt="PsychSignal"
            className={clsx("inline w-auto dark:hidden", props.className)}
            priority
          />

          <Image
            src="/img/icon-dark.svg"
            width={256}
            height={256}
            alt="PsychSignal"
            className={clsx("hidden w-auto dark:inline", props.className)}
            priority
          />
        </>
      ) : (
        <>
          <Image
            src="/img/logo.svg"
            width={832}
            height={128}
            alt="PsychSignal"
            className={clsx("inline w-auto dark:hidden", props.className)}
            priority
          />

          <Image
            src="/img/logo-dark.svg"
            width={832}
            height={128}
            alt="PsychSignal"
            className={clsx("hidden w-auto dark:inline", props.className)}
            priority
          />
        </>
      )}
    </>
  );
}
