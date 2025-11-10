import Image from "next/image";
import clsx from "clsx";

type LogoProps = {
  className?: string;
};

export function Logo(props: LogoProps) {
  return (
    <>
      <Image
        src="/img/logo-icon.png"
        width={128}
        height={128}
        alt="MoodCheck"
        className={clsx("inline w-auto dark:hidden", props.className)}
        priority
      />

      <Image
        src="/img/logo-icon-dark.png"
        width={128}
        height={128}
        alt="MoodCheck"
        className={clsx("hidden w-auto dark:inline", props.className)}
        priority
      />
    </>
  );
}
