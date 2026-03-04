"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TaskCard } from "./TaskCard";
import { updateTaskStatus } from "@/app/actions/tasks";

interface KanbanBoardProps {
    tasks: any[];
    userRole: string;
}

const COLUMNS = [
    { title: "Submitted", status: "Submitted", emptyText: "No requests submitted yet." },
    { title: "In Progress", status: "In Progress", emptyText: "No tasks actively being worked on." },
    { title: "Pending Customer", status: "Pending Customer", emptyText: "Nothing waiting on the client." },
    { title: "On Hold", status: "On Hold", emptyText: "No tasks are blocked." },
    { title: "Review / Done", status: "Review / Done", emptyText: "Nothing in review or completed yet." }
];

export function KanbanBoard({ tasks: initialTasks, userRole }: KanbanBoardProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const router = useRouter();

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData("taskId", taskId);
        // Optional: add styling to dragged element
        e.currentTarget.classList.add("opacity-50");
    };

    const handleDragEnd = (e: React.DragEvent) => {
        e.currentTarget.classList.remove("opacity-50");
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");

        if (!taskId) return;

        // Find task
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;
        const task = tasks[taskIndex];

        // If it's already in that status, do nothing
        if (task.clientStatus === newStatus) return;

        // Optimistic UI Update
        const newTasks = [...tasks];
        newTasks[taskIndex] = { ...task, clientStatus: newStatus };
        setTasks(newTasks);

        try {
            // Background server update
            await updateTaskStatus(taskId, newStatus);
            router.refresh(); // Refresh to ensure server state is sync'd
        } catch (err) {
            console.error("Failed to update status", err);
            // Revert on failure
            setTasks(initialTasks);
            alert("Failed to move task.");
        }
    };

    return (
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
            {COLUMNS.map((col, idx) => {
                const colTasks = tasks.filter(t => t.clientStatus === col.status);

                return (
                    <div
                        key={idx}
                        className="bg-slate-100/70 border border-slate-200/60 p-4 rounded-2xl min-h-[500px] flex flex-col flex-shrink-0 w-80 md:w-auto md:flex-1 snap-center"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.status)}
                    >
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="font-bold text-slate-800 text-sm tracking-wide flex items-center gap-2">
                                {col.title}
                            </h3>
                            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                {colTasks.length}
                            </span>
                        </div>

                        <div className="space-y-4 flex-1 flex flex-col">
                            {colTasks.length > 0 ? (
                                colTasks.map(task => (
                                    <div
                                        key={task.id}
                                        draggable={userRole !== "CLIENT"} // Only let team members drag
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        onDragEnd={handleDragEnd}
                                        className={userRole !== "CLIENT" ? "cursor-grab active:cursor-grabbing" : ""}
                                    >
                                        <TaskCard task={task} userRole={userRole} />
                                    </div>
                                ))
                            ) : (
                                <div className="h-full min-h-[100px] flex-1 flex items-center justify-center border-2 border-dashed border-slate-300/50 rounded-xl m-1">
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
    );
}
