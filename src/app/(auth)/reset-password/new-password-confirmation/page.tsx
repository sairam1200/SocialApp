"use client";
import { useRouter } from "next/navigation";
import {Button} from "@/components/ui/button";
import { AuthCard } from "@/components/authentication";

export default function NewPasswordConfirmationPage() {
  const router = useRouter();
  return (
    <AuthCard width="max-w-[559px]">
      <div className="py-12 px-4 max-sm:px-5.5">
        <h1 className="text-center text-2xl font-bold max-sm:text-xl">Your password has been reset</h1>
        <div className="text-center text-base text-muted-foreground mt-4">
          <p>You can now log in with the new password.</p>
        </div>

        <div className="flex justify-center py-4">
          <Button
            onClick={() => router.push("/login")}
            type="submit"
            size={"default"}
            label={"Go to Sign In"}
            className="h-13 px-8 py-4 text-base font-semibold"
          />
        </div>
      </div>
      </AuthCard>
  );
}
