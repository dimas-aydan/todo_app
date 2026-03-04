import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getComments } from "@/app/actions/comments";
import Link from "next/link";
import { CommentForm } from "@/components/CommentForm";

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
                            <span className="inline-flex px-4 py-1.5 text-sm font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                                {task.clientStatus}
                            </span>
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
                            <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                Assignees
                            </h3>
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

                        {/* Team Management (Hidden from clients) */}
                        {!isClient && (
                            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200/60 shadow-sm">
                                <h3 className="font-bold text-amber-900 mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    Team Management
                                </h3>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-amber-800 text-xs font-bold mb-1.5 uppercase tracking-wide">Internal Status</label>
                                        <select
                                            className="w-full p-2.5 border border-amber-300 rounded-lg bg-white text-slate-900 font-medium text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-sm"
                                            defaultValue={task.internalStatus || "Inbox"}
                                        >
                                            <option value="Inbox">Inbox / Triage</option>
                                            <option value="Development">Development</option>
                                            <option value="QA">QA / Review</option>
                                            <option value="Blocked">Blocked</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-amber-800 text-xs font-bold mb-1.5 uppercase tracking-wide">Time Estimate (mins)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="w-full p-2.5 border border-amber-300 rounded-lg bg-white text-slate-900 font-medium text-sm placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-sm pl-9"
                                                defaultValue={task.timeEstimate || ""}
                                                placeholder="e.g. 120"
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-amber-800 text-xs font-bold mb-1.5 uppercase tracking-wide">Time Tracked (mins)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="w-full p-2.5 border border-amber-300 rounded-lg bg-white text-slate-900 font-medium text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-sm pl-9"
                                                defaultValue={task.timeTracked || 0}
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm">
                                        Update Meta
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}
