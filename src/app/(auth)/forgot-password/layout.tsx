import { AuthCard } from "@/components/authentication";

export default function ConfirmEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthCard width="max-w-[708px]">
      {children}
    </AuthCard>
  );
}
