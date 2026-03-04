import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getProjects, getTasks } from "../actions/tasks";
import { KanbanBoard } from "@/components/KanbanBoard";
import Link from "next/link";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const projects = await getProjects();
    const activeProject = projects[0];
    let tasks: any[] = [];

    if (activeProject) {
        tasks = await getTasks(activeProject.id);
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-screen-2xl mx-auto">
                <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Dashboard</h1>
                        {activeProject && (
                            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                                {activeProject.name}
                            </p>
                        )}
                    </div>

                    {session.user.role === "CLIENT" && (
                        <Link href="/submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow hover:bg-blue-700 transition-all font-semibold text-sm inline-flex items-center gap-2 active:scale-95">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Submit Request
                        </Link>
                    )}
                </header>

                {activeProject ? (
                    <KanbanBoard tasks={tasks} userRole={session.user.role} />
                ) : (
                    <div className="p-16 text-center bg-white rounded-2xl shadow-sm border border-slate-200 max-w-2xl mx-auto mt-12">
                        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">No Projects Assigned</h2>
                        <p className="text-slate-500 max-w-md mx-auto">You do not have access to any projects yet. If you believe this is an error, please contact your account manager.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
