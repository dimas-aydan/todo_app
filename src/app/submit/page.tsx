import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getProjects, createTask } from "../actions/tasks";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function SubmitRequestPage() {
    const session = await getServerSession(authOptions);

    // Only clients (and admins) should use this specific flow
    if (!session?.user || session.user.role === "TEAM") {
        redirect("/dashboard");
    }

    const projects = await getProjects();
    const activeProject = projects[0];

    if (!activeProject) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                <div className="text-center bg-white rounded-2xl shadow border border-slate-200 p-12 max-w-md">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Project</h2>
                    <p className="text-slate-500">You don't have any active projects to submit to. Please contact your account manager.</p>
                </div>
            </div>
        );
    }

    // Server action — reads projectId from hidden input to avoid closure issues
    async function handleSubmit(formData: FormData) {
        "use server";
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const projectId = formData.get("projectId") as string;

        if (!title || !projectId) return;

        await createTask(projectId, { title, description });
        revalidatePath("/dashboard");
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

                <div className="mb-8">
                    <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors text-sm mb-4 inline-flex items-center gap-1 font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Submit New Request</h1>
                    <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                        {activeProject.name}
                    </p>
                </div>

                <form action={handleSubmit} className="space-y-6">
                    {/* Hidden projectId to safely pass to server action */}
                    <input type="hidden" name="projectId" value={activeProject.id} />

                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-1.5">
                            Request Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            autoFocus
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 placeholder-slate-400"
                            placeholder="e.g. Update the logo in the footer"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-1.5">
                            Details / Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={6}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 placeholder-slate-400 resize-y"
                            placeholder="Please provide any relevant details, links, screenshots, or context..."
                        ></textarea>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                        <Link
                            href="/dashboard"
                            className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium text-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm active:scale-95 text-sm"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}

