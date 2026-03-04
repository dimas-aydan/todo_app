import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getComments } from "@/app/actions/comments";
import { getAvailableAssignees } from "@/app/actions/tasks";
import Link from "next/link";
import { CommentForm } from "@/components/CommentForm";
import { TaskManagement } from "@/components/TaskManagement";
import { AssignToMeButton } from "@/components/AssignToMeButton";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;

    const task = await prisma.task.findUnique({
        where: { id },
        include: {
            project: true,
            assignees: {
                include: { user: { select: { id: true, name: true, email: true } } }
            }
        }
    });

    if (!task) {
        return <div className="p-8 text-center bg-slate-50 h-screen text-slate-900 font-medium">Task not found</div>;
    }

    const comments = await getComments(task.id);
    const isClient = session.user.role === "CLIENT";

    // Only fetch members if the user is a team member/admin
    let availableMembers: any[] = [];
    if (!isClient) {
        availableMembers = await getAvailableAssignees(task.projectId);
    }

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center py-10 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-5xl">

                {/* Header Area */}
                <div className="mb-6">
                    <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors text-sm mb-4 inline-flex items-center gap-1 font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mt-2">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{task.title}</h1>
                            <p className="text-slate-600 font-medium mt-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                                {task.project.name}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            {(() => {
                                const STATUS_COLORS: Record<string, string> = {
                                    "Submitted": "bg-green-100 text-green-700 border-green-200",
                                    "In Progress": "bg-orange-100 text-orange-700 border-orange-200",
                                    "Pending Customer": "bg-purple-100 text-purple-700 border-purple-200",
                                    "On Hold": "bg-blue-100 text-blue-700 border-blue-200",
                                    "Review / Done": "bg-gray-100 text-gray-700 border-gray-200"
                                };
                                const colorClass = STATUS_COLORS[task.clientStatus] || "bg-slate-100 text-slate-700 border-slate-200";

                                return (
                                    <span className={`inline-flex px-4 py-1.5 text-sm font-semibold rounded-full border shadow-sm ${colorClass}`}>
                                        {task.clientStatus}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Description */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                                Description
                            </h2>
                            <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {task.description || <span className="text-slate-400 italic">No description provided.</span>}
                            </div>
                        </section>

                        {/* Discussion */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                Discussion
                            </h2>

                            <div className="space-y-5 mb-8">
                                {comments.length === 0 && (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <p className="text-slate-500 font-medium">No comments yet. Start the conversation!</p>
                                    </div>
                                )}

                                {comments.map((comment: any) => (
                                    <div
                                        key={comment.id}
                                        className={`p-5 rounded-2xl border ${comment.isInternal
                                            ? 'bg-amber-50/50 border-amber-200'
                                            : 'bg-white border-slate-200 shadow-sm'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${comment.author.role === 'CLIENT' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                                                    {comment.author.name?.[0].toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-sm text-slate-900 block">
                                                        {comment.author.name} {comment.author.role === 'CLIENT' ? <span className="text-indigo-600 font-medium">(Client)</span> : ''}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>

                                            {comment.isInternal && (
                                                <span className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-md tracking-wider">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                                    Internal
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed pl-11">{comment.content}</p>
                                    </div>
                                ))}
                            </div>

                            <CommentForm taskId={task.id} isClient={isClient} />

                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Assignees */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                    Assignees
                                </h3>
                                <AssignToMeButton taskId={task.id} currentUser={session.user} />
                            </div>
                            {task.assignees.length > 0 ? (
                                <ul className="space-y-3 mt-4">
                                    {task.assignees.map(a => (
                                        <li key={a.id} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs ring-2 ring-white">
                                                {(a.user.name || a.user.email)[0].toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-900">{a.user.name || "Unknown"}</span>
                                                <span className="text-xs text-slate-500 truncate max-w-[150px]">{a.user.email}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                                    <p className="text-sm text-slate-500 italic">Unassigned</p>
                                </div>
                            )}
                        </div>

                        {/* Interactive Team Management (Hidden from clients) */}
                        {!isClient && (
                            <TaskManagement task={task} members={availableMembers} currentUser={session.user} />
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}
