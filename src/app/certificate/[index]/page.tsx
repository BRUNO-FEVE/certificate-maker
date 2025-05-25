"use client";
import Certificate from "@/components/certificate";
import { memberList } from "@/app/list";
import { use } from "react";

interface Props {
  params: Promise<{ index: string }>;
}

export default function CertificatePage({ params }: Props) {
  const { index } = use(params); // <--- unwrap Promise
  const member = memberList[Number(index)]; // garante que é número

  if (!member) return <div>Not found</div>;

  return (
    <div style={{ width: 1200, height: "fit-content" }}>
      <Certificate
        name={member.Nome}
        role={member.Cargo}
        hour={member["Horas"]}
      />
    </div>
  );
}
