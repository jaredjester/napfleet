import { AdminSidebar } from "./AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-white">
      <AdminSidebar />
      <div className="lg:pl-56">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
