"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignUserToTask } from "@/app/actions/tasks";

export function AssignToMeButton({ taskId, currentUser }: { taskId: string; currentUser: any }) {
    const router = useRouter();
    const [isAssigning, setIsAssigning] = useState(false);

    const handleAssignToMe = async () => {
        if (!currentUser) return;
        setIsAssigning(true);

        try {
            const res = await assignUserToTask(taskId, currentUser.id, currentUser.name || currentUser.email);
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

    if (!currentUser || currentUser.role === "CLIENT") return null;

    return (
        <button
            onClick={handleAssignToMe}
            disabled={isAssigning}
            className="text-[11px] text-blue-600 font-bold hover:text-blue-800 hover:underline tracking-wide disabled:opacity-50"
        >
            {isAssigning ? "Assigning..." : "Assign to me"}
        </button>
    );
}
