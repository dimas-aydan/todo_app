"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";

async function getSession() {
    return await getServerSession(authOptions);
}

export async function getProjects() {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    // Admins see all projects
    if (session.user.role === "ADMIN") {
        return prisma.project.findMany();
    }

    // Team and Clients see projects they are members of
    return prisma.project.findMany({
        where: {
            members: {
                some: {
                    userId: session.user.id
                }
            }
        }
    });
}

export async function getTasks(projectId: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    // Verify access to project
    if (session.user.role !== "ADMIN") {
        const isMember = await prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: session.user.id } }
        });
        if (!isMember) throw new Error("Forbidden");
    }

    const tasks = await prisma.task.findMany({
        where: { projectId },
        include: {
            assignees: {
                include: { user: { select: { name: true, email: true } } }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    // Role-based data filtering: Strip internal fields for clients
    if (session.user.role === "CLIENT") {
        return tasks.map(task => {
            // Create a clean object using rest syntax to omit internal fields
            const { internalStatus, timeEstimate, timeTracked, ...cleanTask } = task;
            return cleanTask;
        });
    }

    return tasks;
}

export async function createTask(projectId: string, data: { title: string, description?: string }) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    // Everyone can create a task if they have project access, 
    // but clients can ONLY create tasks with 'Submitted' status.
    const clientStatus = "Submitted";
    const internalStatus = session.user.role === "CLIENT" ? "Triage" : "Development";

    return prisma.task.create({
        data: {
            projectId,
            title: data.title,
            description: data.description,
            clientStatus,
            internalStatus,
        }
    });
}

// Additional update functions would follow similar strict RBAC logic
