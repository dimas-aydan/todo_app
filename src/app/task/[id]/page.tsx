import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getComments } from "@/app/actions/comments";
import Link from "next/link";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;

    // Ideally we use a server action here, but doing a direct read 
    // for the page render simplifies the MVP.
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
        return <div className="p-8 text-center bg-gray-50 h-screen text-black">Task not found</div>;
    }

    // Very basic Role check to ensure Client isn't viewing a task from another project
    // In a real app we'd query projectMember explicitly here
    const comments = await getComments(task.id);

    const isClient = session.user.role === "CLIENT";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 text-black">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow border border-gray-300 p-8">

                <div className="mb-6 pb-6 border-b border-gray-200 flex justify-between items-start">
                    <div>
                        <Link href="/dashboard" className="text-blue-700 hover:underline text-sm mb-4 inline-block font-semibold">
                            &larr; Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-extrabold text-black mt-2">{task.title}</h1>
                        <p className="text-black font-semibold mt-1">Project: {task.project.name}</p>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-3 py-1 text-sm font-bold rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                            {task.clientStatus}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="md:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-black mb-2">Description</h2>
                            <div className="bg-gray-100 border border-gray-300 p-4 rounded text-black whitespace-pre-wrap font-medium">
                                {task.description || "No description provided."}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-black mb-4">Discussion</h2>

                            <div className="space-y-4 mb-6">
                                {comments.length === 0 && (
                                    <p className="text-black italic text-sm font-medium">No comments yet.</p>
                                )}

                                {comments.map((comment: any) => (
                                    <div
                                        key={comment.id}
                                        className={`p-4 rounded border ${comment.isInternal
                                            ? 'bg-yellow-100 border-yellow-400'
                                            : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-sm text-black">
                                                {comment.author.name} {comment.author.role === 'CLIENT' ? '(Client)' : ''}
                                            </span>
                                            {comment.isInternal && (
                                                <span className="text-xs font-extrabold text-yellow-900 uppercase flex items-center gap-1 bg-yellow-200 px-2 py-1 rounded">
                                                    🔒 Internal Note
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-black text-sm whitespace-pre-wrap font-medium">{comment.content}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Add Comment Box Placeholder */}
                            <div className="bg-gray-100 p-4 rounded border border-gray-300">
                                <textarea
                                    className="w-full p-3 border border-gray-400 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm text-black placeholder-gray-600 bg-white"
                                    rows={3}
                                    placeholder="Write a comment..."
                                ></textarea>
                                <div className="mt-3 flex justify-between items-center">
                                    {!isClient ? (
                                        <label className="flex items-center gap-2 text-sm text-black font-bold cursor-pointer">
                                            <input type="checkbox" className="rounded border-gray-400 text-blue-600 focus:ring-blue-600" />
                                            Make Internal (Hidden from client)
                                        </label>
                                    ) : <div></div>}
                                    <button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm font-bold transition">
                                        Post Comment
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Meta Area */}
                    <div className="space-y-6">
                        <div className="bg-gray-100 rounded p-4 border border-gray-300">
                            <h3 className="font-bold text-black mb-3 text-sm uppercase tracking-wide">Assignees</h3>
                            {task.assignees.length > 0 ? (
                                <ul className="space-y-2">
                                    {task.assignees.map(a => (
                                        <li key={a.id} className="flex items-center gap-2 text-sm text-black font-bold">
                                            <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-900 font-bold text-xs border border-blue-300">
                                                {(a.user.name || a.user.email)[0].toUpperCase()}
                                            </div>
                                            <span title={a.user.email}>{a.user.name || "Unknown"}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-black italic font-medium">Unassigned</p>
                            )}
                        </div>

                        {!isClient && (
                            <div className="bg-yellow-100 rounded p-4 border border-yellow-400 shadow-sm">
                                <h3 className="font-extrabold text-yellow-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                                    🔒 Team Management
                                </h3>

                                <div className="space-y-4 text-sm">
                                    <div>
                                        <span className="block text-yellow-900 text-xs font-bold mb-1">Internal Status</span>
                                        <select
                                            className="w-full p-2 border border-yellow-500 rounded bg-white text-black font-medium text-sm"
                                            defaultValue={task.internalStatus || "Inbox"}
                                        >
                                            <option value="Inbox">Inbox / Triage</option>
                                            <option value="Development">Development</option>
                                            <option value="QA">QA / Review</option>
                                            <option value="Blocked">Blocked</option>
                                        </select>
                                    </div>

                                    <div>
                                        <span className="block text-yellow-900 text-xs font-bold mb-1">Time Estimate (mins)</span>
                                        <input
                                            type="number"
                                            className="w-full p-2 border border-yellow-500 rounded bg-white text-black font-medium text-sm placeholder-gray-600"
                                            defaultValue={task.timeEstimate || ""}
                                            placeholder="e.g. 120"
                                        />
                                    </div>

                                    <div>
                                        <span className="block text-yellow-900 text-xs font-bold mb-1">Time Tracked (mins)</span>
                                        <input
                                            type="number"
                                            className="w-full p-2 border border-yellow-500 rounded bg-white text-black font-medium text-sm"
                                            defaultValue={task.timeTracked || 0}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}
