import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";

const doodleFiles = [
  "BalletDoodle.svg",
  "BikiniDoodle.svg",
  "CoffeeDoddle.svg",
  "DancingDoodle.svg",
  "DogJumpDoodle.svg",
  "DoogieDoodle.svg",
  "DumpingDoodle.svg",
  "FloatDoodle.svg",
  "GroovyDoodle.svg",
  "GroovySittingDoodle.svg",
  "IceCreamDoodle.svg",
  "LayingDoodle.svg",
  "LovingDoodle.svg",
  "MeditatingDoodle.svg",
  "MessyDoodle.svg",
  "MoshingDoodle.svg",
  "PettingDoodle.svg",
  "PlantDoodle.svg",
  "ReadingDoodle.svg",
  "ReadingSideDoodle.svg",
  "RollerSkatingDoodle.svg",
  "RollingDoodle.svg",
  "RunningDoodle.svg",
  "SelfieDoodle.svg",
  "SitReadingDoodle.svg",
  "SittingDoodle.svg",
  "SleekDoodle.svg",
  "SprintingDoodle.svg",
  "StrollingDoodle.svg",
  "SwingingDoodle.svg",
  "UnboxingDoodle.svg",
  "ZombieingDoodle.svg",
];

type DoodleProps = {
  doodles: number | number[];
  className?: string;
  onLoad?: () => void;
};

export default function Doodle(props: DoodleProps) {
  const indices = Array.isArray(props.doodles) ? props.doodles : [props.doodles];
  const [file, setFile] = useState<string>();

  useEffect(() => {
    const index = indices[Math.floor(Math.random() * indices.length)];
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const path = isDark ? "/img/doodles/dark/" : "/img/doodles/";
    setFile(path + doodleFiles[index]);
  }, []);

  return (
    <div className={clsx("aspect-4/3 w-2xs", props.className)}>
      {file && <Image src={file} width={1024} height={768} alt="Doodle" onLoad={props.onLoad} priority />}
    </div>
  );
}
