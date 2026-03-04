import Link from "next/link";
import { Task } from "@prisma/client";

// This type allows us to handle the task regardless of if it's 
// fully fetched (Team) or stripped down (Client)
type TaskProps = Partial<Task> & {
    id: string;
    title: string;
    clientStatus: string;
    assignees?: Array<{ user: { name: string; email: string } }>;
};

export function TaskCard({ task, userRole }: { task: TaskProps, userRole: string }) {
    return (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
                <Link href={`/task/${task.id}`}>
                    <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                        {task.title}
                    </h3>
                </Link>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {task.clientStatus}
                </span>
            </div>

            {/* Team Only Badges */}
            {userRole !== "CLIENT" && (
                <div className="flex gap-2 mb-3">
                    {task.internalStatus && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 border border-gray-300">
                            Internal: {task.internalStatus}
                        </span>
                    )}
                    {task.timeEstimate !== undefined && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-50 text-yellow-700 border border-yellow-200">
                            Est: {task.timeEstimate}m
                        </span>
                    )}
                </div>
            )}

            {/* Assignees - Visible to Everyone */}
            {task.assignees && task.assignees.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                    <span>Assigned:</span>
                    <div className="flex gap-1">
                        {task.assignees.map((a, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs" title={a.user.email}>
                                {a.user.name || "User"}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
