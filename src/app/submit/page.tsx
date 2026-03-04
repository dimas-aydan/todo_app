import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getProjects, createTask } from "../actions/tasks";
import { revalidatePath } from "next/cache";

export default async function SubmitRequestPage() {
    const session = await getServerSession(authOptions);

    // Only clients (and maybe admins) should use this specific flow in the MVP
    if (!session?.user || session.user.role === "TEAM") {
        redirect("/dashboard");
    }

    const projects = await getProjects();
    const activeProject = projects[0];

    if (!activeProject) {
        return <div className="p-8 text-center bg-gray-50 h-screen">No active project found to submit to.</div>;
    }

    // Server action for handling the form submission
    async function handleSubmit(formData: FormData) {
        "use server";
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;

        if (!title) return;

        await createTask(activeProject.id, { title, description });
        revalidatePath("/dashboard");
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow border border-gray-200 p-8">

                <h1 className="text-2xl font-bold mb-6">Submit New Request</h1>
                <p className="text-gray-600 mb-8">
                    Project: <span className="font-semibold">{activeProject.name}</span>
                </p>

                <form action={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Request Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Update logo in the footer"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Details / Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={5}
                            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Please provide any relevant details, links, or context..."
                        ></textarea>
                    </div>

                    <div className="flex gap-4 justify-end pt-4 border-t border-gray-100">
                        <a href="/dashboard" className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition">
                            Cancel
                        </a>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition shadow"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
