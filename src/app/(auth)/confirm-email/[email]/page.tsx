import React from "react";
import VerifyForm from "./components/verifyForm";

interface ConfirmEmailProps {
  params: { email: string };
}

export default async function ConfirmEmailPage({ params }: ConfirmEmailProps) {
  const confirmEmailProps = await params;
  const email = decodeURIComponent(confirmEmailProps.email);
  return (
      <div className="border-[#A288FF] p-6 max-[425px]:px-6 max-[425px]:pt-6 max-sm:pb-1.5">
        <VerifyForm email={email}/>
      </div>
  );
}
