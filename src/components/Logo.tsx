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
        <Image
          src="/img/icon.svg"
          width={128}
          height={128}
          alt="HowsWork"
          className={clsx("inline w-auto", props.className)}
          priority
        />
      ) : (
        <Image
          src="/img/logo.svg"
          width={728}
          height={128}
          alt="HowsWork"
          className={clsx("inline w-auto", props.className)}
          priority
        />
      )}
    </>
  );
}
