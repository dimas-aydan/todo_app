"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignUserToTask, updateTaskStatus } from "@/app/actions/tasks";

export function TaskManagement({ task, members, currentUser }: { task: any; members: any[]; currentUser?: any }) {
    const router = useRouter();

    const [clientStatus, setClientStatus] = useState(task.clientStatus || "Submitted");
    const [internalStatus, setInternalStatus] = useState(task.internalStatus || "Inbox");
    const [selectedUser, setSelectedUser] = useState("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    const handleAssignToMe = async () => {
        if (!currentUser) return;
        setIsAssigning(true);

        try {
            const res = await assignUserToTask(task.id, currentUser.id, currentUser.name || currentUser.email);
            if (res.success) {
                router.refresh();
            } else {
                alert(res.message);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to assign user.");
        } finally {
            setIsAssigning(false);
        }
    };

    const handleUpdateStatus = async () => {
        setIsUpdatingStatus(true);
        try {
            await updateTaskStatus(task.id, clientStatus, internalStatus);
            router.refresh();
            alert("Status updated successfully.");
        } catch (e) {
            console.error(e);
            alert("Failed to update status.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleAssignUser = async () => {
        if (!selectedUser) return;
        setIsAssigning(true);

        try {
            const user = members.find(m => m.user.id === selectedUser)?.user;
            if (!user) return;

            const res = await assignUserToTask(task.id, user.id, user.name || user.email);
            if (res.success) {
                router.refresh();
                setSelectedUser(""); // Reset dropdown
            } else {
                alert(res.message);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to assign user.");
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200/60 shadow-sm">
            <h3 className="font-bold text-amber-900 mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Team Management
            </h3>

            <div className="space-y-5">
                <div>
                    <label className="block text-amber-800 text-xs font-bold mb-1.5 uppercase tracking-wide">Client Status</label>
                    <select
                        className="w-full p-2.5 border border-amber-300 rounded-lg bg-white text-slate-900 font-medium text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-sm"
                        value={clientStatus}
                        onChange={(e) => setClientStatus(e.target.value)}
                    >
                        <option value="Submitted">Submitted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Pending Customer">Pending Customer</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Review / Done">Review / Done</option>
                    </select>
                </div>

                <div>
                    <label className="block text-amber-800 text-xs font-bold mb-1.5 uppercase tracking-wide">Internal Status</label>
                    <select
                        className="w-full p-2.5 border border-amber-300 rounded-lg bg-white text-slate-900 font-medium text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-sm"
                        value={internalStatus}
                        onChange={(e) => setInternalStatus(e.target.value)}
                    >
                        <option value="Triage">Inbox / Triage</option>
                        <option value="Development">Development</option>
                        <option value="QA">QA / Review</option>
                        <option value="Blocked">Blocked</option>
                    </select>
                </div>

                <button
                    onClick={handleUpdateStatus}
                    disabled={isUpdatingStatus}
                    className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors shadow-sm disabled:bg-amber-400"
                >
                    {isUpdatingStatus ? "Updating..." : "Update Statuses"}
                </button>

                <div className="border-t border-amber-200/60 pt-5 mt-5">
                    <label className="block text-amber-800 text-xs font-bold mb-1.5 uppercase tracking-wide">Assign Member</label>
                    <div className="flex gap-2">
                        <select
                            className="flex-1 p-2.5 border border-amber-300 rounded-lg bg-white text-slate-900 font-medium text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-sm"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="">Select Member...</option>
                            {members.map(m => (
                                <option key={m.user.id} value={m.user.id}>
                                    {m.user.name || m.user.email} ({m.user.role})
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleAssignUser}
                            disabled={isAssigning || !selectedUser}
                            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm disabled:bg-blue-400"
                        >
                            {isAssigning ? "..." : "Add"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
