import React from "react";
import Image from "next/image";
import imgPath from "../../public/1.png";
import { cn } from "@/lib/utils";

interface CertificateProps {
  name: string;
  role: string;
  hour: number;
}

export default function Certificate({ name, role, hour }: CertificateProps) {
  return (
    <div className={cn("relative")}>
      <Image src={imgPath} alt={""} />
      <h1
        id="title"
        className="absolute w-full  text-[48px] text-center italic top-[390px] left-1/2 -translate-x-1/2"
      >
        {name.toUpperCase()}
      </h1>
      <p
        id="title"
        className="absolute text-[30px] text-center w-4/5 italic top-[465px] left-1/2 -translate-x-1/2"
      >
        Participou da FGV Real Estate como {role} durante o semestre de 2024.1
        em carga horária equivalente a {hour} horas.
      </p>
    </div>
  );
}
