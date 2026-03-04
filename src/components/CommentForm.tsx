"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addComment } from "@/app/actions/comments";

interface CommentFormProps {
    taskId: string;
    isClient: boolean;
}

export function CommentForm({ taskId, isClient }: CommentFormProps) {
    const [content, setContent] = useState("");
    const [isInternal, setIsInternal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addComment(taskId, content, isInternal);
            setContent("");
            setIsInternal(false);
            router.refresh(); // Refresh to show the new comment
        } catch (error) {
            console.error("Failed to post comment:", error);
            alert("Failed to post comment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
            <textarea
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-800 placeholder-slate-400 bg-white resize-y min-h-[100px] transition-shadow"
                rows={3}
                placeholder="Write a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
            ></textarea>

            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                {!isClient ? (
                    <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer group">
                        <input
                            type="checkbox"
                            className="rounded border-slate-400 text-yellow-500 focus:ring-yellow-500 w-4 h-4 cursor-pointer"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            disabled={isSubmitting}
                        />
                        <span className="group-hover:text-slate-900 transition-colors">Make Internal (Hidden from client)</span>
                    </label>
                ) : (
                    <div></div> // Spacer for clients
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-[0.98] w-full sm:w-auto flex justify-center items-center"
                >
                    {isSubmitting ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : null}
                    {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
            </div>
        </form>
    );
}
