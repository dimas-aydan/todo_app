import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getProjects, getTasks } from "../actions/tasks";
import { TaskCard } from "@/components/TaskCard";
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

    // Custom Kanban Board Columns based on simple client statuses
    const columns = [
        { title: "Submitted", status: "Submitted", emptyText: "No requests submitted yet." },
        { title: "In Progress", status: "In Progress", emptyText: "No tasks actively being worked on." },
        { title: "Review / Done", status: ["Review", "Done"], emptyText: "Nothing in review or completed yet." }
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
                        {columns.map((col, idx) => {
                            const colTasks = tasks.filter(t =>
                                Array.isArray(col.status)
                                    ? col.status.includes(t.clientStatus)
                                    : t.clientStatus === col.status
                            );

                            return (
                                <div key={idx} className="bg-slate-100/70 border border-slate-200/60 p-4 rounded-2xl min-h-[500px] flex flex-col">
                                    <div className="flex items-center justify-between xl mb-4 px-2">
                                        <h3 className="font-bold text-slate-800 text-sm tracking-wide flex items-center gap-2">
                                            {col.title}
                                        </h3>
                                        <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                            {colTasks.length}
                                        </span>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        {colTasks.length > 0 ? (
                                            colTasks.map(task => (
                                                <TaskCard key={task.id} task={task} userRole={session.user.role} />
                                            ))
                                        ) : (
                                            <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-300/50 rounded-xl">
                                                <p className="text-sm text-slate-400 font-medium text-center px-4">
                                                    {col.emptyText}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
