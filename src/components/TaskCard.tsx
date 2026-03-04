import Link from "next/link";
import { Task } from "@prisma/client";

type TaskProps = Partial<Task> & {
    id: string;
    title: string;
    clientStatus: string;
    assignees?: Array<{ user: { name: string; email: string } }>;
};

const STATUS_COLORS: Record<string, string> = {
    "Submitted": "bg-green-100 text-green-700 border-green-200",
    "In Progress": "bg-orange-100 text-orange-700 border-orange-200",
    "Pending Customer": "bg-purple-100 text-purple-700 border-purple-200",
    "On Hold": "bg-blue-100 text-blue-700 border-blue-200",
    "Review / Done": "bg-gray-100 text-gray-700 border-gray-200"
};

export function TaskCard({ task, userRole }: { task: TaskProps, userRole: string }) {
    const statusColor = STATUS_COLORS[task.clientStatus] || "bg-slate-100 text-slate-600 border-slate-200";

    return (
        <div className="group p-5 bg-white border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer relative overflow-hidden">
            {/* Subtle left accent bar on hover */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex flex-col items-start gap-2 mb-3">
                <Link href={`/task/${task.id}`} className="w-full before:absolute before:inset-0">
                    <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                        {task.title}
                    </h3>
                </Link>
                <div className="flex-shrink-0">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${statusColor}`}>
                        {task.clientStatus}
                    </span>
                </div>
            </div>

            {/* Team Only Badges */}
            {userRole !== "CLIENT" && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {task.internalStatus && (
                        <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            {task.internalStatus}
                        </span>
                    )}
                    {task.timeEstimate !== undefined && (
                        <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {task.timeEstimate}m
                        </span>
                    )}
                </div>
            )}

            {/* Assignees - Visible to Everyone */}
            <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Assignees</span>

                {task.assignees && task.assignees.length > 0 ? (
                    <div className="flex -space-x-2">
                        {task.assignees.map((a, i) => (
                            <div
                                key={i}
                                className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px] ring-2 ring-white z-10 hover:z-20 transition-transform hover:scale-110"
                                title={a.user.email}
                            >
                                {(a.user.name || a.user.email)[0].toUpperCase()}
                            </div>
                        ))}
                    </div>
                ) : (
                    <span className="text-xs text-slate-400 italic">Unassigned</span>
                )}
            </div>
        </div>
    );
}
