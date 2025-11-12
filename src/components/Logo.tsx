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
            src="/img/logo-icon.png"
            width={256}
            height={256}
            alt="MoodCheck"
            className={clsx("inline w-auto dark:hidden", props.className)}
            priority
          />

          <Image
            src="/img/logo-icon-dark.png"
            width={256}
            height={256}
            alt="MoodCheck"
            className={clsx("hidden w-auto dark:inline", props.className)}
            priority
          />
        </>
      ) : (
        <>
          <Image
            src="/img/logo.png"
            width={784}
            height={128}
            alt="MoodCheck"
            className={clsx("inline w-auto dark:hidden", props.className)}
            priority
          />

          <Image
            src="/img/logo-dark.png"
            width={784}
            height={128}
            alt="MoodCheck"
            className={clsx("hidden w-auto dark:inline", props.className)}
            priority
          />
        </>
      )}
    </>
  );
}
