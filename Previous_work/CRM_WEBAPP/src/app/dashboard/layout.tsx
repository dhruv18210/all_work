import { Sidebar } from "@/components/layout/Sidebar/Sidebar";
import styles from "./layout.module.css";
import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (session.userId === 'guest') {
    redirect("/auth/login");
  }

  if (!session.organizationId && session.role !== 'ADMIN' && session.role !== 'MANAGER') {
    redirect("/auth/join");
  }

  return (
    <div className={styles.layout}>
      <Sidebar initialRole={session.role} initialEmail={session.email} />
      <main className={styles.content}>
        <div className={styles.topBar}>
          <div className={styles.search}>
            <input type="text" placeholder="Search leads, calls, transcripts..." className={styles.searchInput} />
          </div>
          <div className={styles.actions}>
            {/* Notifications, Help, etc. */}
          </div>
        </div>
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
