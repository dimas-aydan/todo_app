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

    // Fetch the user's projects
    const projects = await getProjects();

    // For the MVP, we just take the first project they have access to.
    // In a real app, there would be a project selector.
    const activeProject = projects[0];
    let tasks: any[] = [];

    if (activeProject) {
        tasks = await getTasks(activeProject.id);
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="flex justify-between items-center mb-8 pb-4 border-b">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-600">
                        Welcome back, {session.user.name} ({session.user.role})
                    </p>
                </div>

                {session.user.role === "CLIENT" && (
                    <Link href="/submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 inline-block">
                        + Submit Request
                    </Link>
                )}
            </header>

            {activeProject ? (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Project: {activeProject.name}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Simple Columns for MVP */}
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <h3 className="font-bold text-gray-700 mb-4 uppercase text-sm tracking-wide">Submitted / Triage</h3>
                            <div className="space-y-4">
                                {tasks.filter(t => t.clientStatus === "Submitted").map(task => (
                                    <TaskCard key={task.id} task={task} userRole={session.user.role} />
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-lg">
                            <h3 className="font-bold text-gray-700 mb-4 uppercase text-sm tracking-wide">In Progress</h3>
                            <div className="space-y-4">
                                {tasks.filter(t => t.clientStatus === "In Progress").map(task => (
                                    <TaskCard key={task.id} task={task} userRole={session.user.role} />
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-lg">
                            <h3 className="font-bold text-gray-700 mb-4 uppercase text-sm tracking-wide">Review / Done</h3>
                            <div className="space-y-4">
                                {tasks.filter(t => ["Review", "Done"].includes(t.clientStatus)).map(task => (
                                    <TaskCard key={task.id} task={task} userRole={session.user.role} />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                <div className="p-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
                    <p className="text-lg text-gray-600">You do not have access to any projects yet.</p>
                </div>
            )}
        </div>
    );
}
