import React from "react";
import VerifyForm from "./components/verifyForm";
import ConfirmEmailGuard from "./components/confirmEmailGuard";

interface ConfirmEmailProps {
  params: { email: string };
  searchParams?: { code?: string };
}

export default async function ConfirmEmailPage({ params, searchParams }: ConfirmEmailProps) {
  const confirmEmailProps = await params;
  const resolvedSearchParams = await searchParams;
  const email = decodeURIComponent(confirmEmailProps.email);
  const code = resolvedSearchParams?.code;
  return (
      <div className="border-[#A288FF] p-6 max-[425px]:px-6 max-[425px]:pt-6 max-sm:pb-1.5">
        <ConfirmEmailGuard email={email} />
        <VerifyForm email={email} code={code}/>
      </div>
  );
}
