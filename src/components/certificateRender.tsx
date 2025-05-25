// components/CertificateRenderer.tsx   ← *client* component
"use client";

type Member = {
  Nome: string;
  Cargo: string;
  Horas: number;
};

import Certificate from "./certificate";

export default function CertificateRenderer({ member }: { member: Member }) {
  return (
    <div style={{ width: 1200, height: "fit-content" }}>
      <Certificate name={member.Nome} role={member.Cargo} hour={member.Horas} />
    </div>
  );
}
