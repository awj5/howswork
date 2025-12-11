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
          {/* Light mode version */}
          <Image
            src="/img/icon.svg"
            width={128}
            height={128}
            alt="How's Work"
            className={clsx("inline w-auto dark:hidden", props.className)}
            priority
          />

          {/* Dark mode version */}
          <Image
            src="/img/icon-dark.svg"
            width={128}
            height={128}
            alt="How's Work"
            className={clsx("w-auto not-dark:hidden", props.className)}
            priority
          />
        </>
      ) : (
        <>
          {/* Light mode version */}
          <Image
            src="/img/logo.svg"
            width={728}
            height={128}
            alt="How's Work"
            className={clsx("inline w-auto dark:hidden", props.className)}
            priority
          />

          {/* Dark mode version */}
          <Image
            src="/img/logo-dark.svg"
            width={728}
            height={128}
            alt="How's Work"
            className={clsx("w-auto not-dark:hidden", props.className)}
            priority
          />
        </>
      )}
    </>
  );
}
