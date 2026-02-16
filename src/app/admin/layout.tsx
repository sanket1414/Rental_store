import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-[#050505]">
                <AdminSidebar />
                <main className="ml-64 p-8">
                    {children}
                </main>
            </div>
        </AdminGuard>
    );
}
