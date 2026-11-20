import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (session.role !== 'ADMIN' && session.role !== 'MANAGER') {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
