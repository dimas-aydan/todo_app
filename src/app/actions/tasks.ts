"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { addComment } from "./comments"; // Reuse our comment logic to add history!

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
            const { internalStatus, timeEstimate, timeTracked, ...cleanTask } = task;
            return cleanTask;
        });
    }

    return tasks;
}

export async function createTask(projectId: string, data: { title: string, description?: string }) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

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

// ============== NEW ACTIONS FOR PART 2 ==============

export async function getAvailableAssignees(projectId: string) {
    const session = await getSession();
    if (!session?.user || session.user.role === "CLIENT") throw new Error("Unauthorized");

    // Fetch team members and admins from this project
    return prisma.projectMember.findMany({
        where: {
            projectId,
            user: {
                role: { in: ['ADMIN', 'TEAM'] }
            }
        },
        include: {
            user: {
                select: { id: true, name: true, email: true, role: true }
            }
        }
    });
}

export async function assignUserToTask(taskId: string, userId: string, userName: string) {
    const session = await getSession();
    if (!session?.user || session.user.role === "CLIENT") throw new Error("Unauthorized");

    // Check if they are already assigned to prevent unique constraint errors
    const existing = await prisma.taskAssignee.findUnique({
        where: { taskId_userId: { taskId, userId } }
    });

    if (existing) return { success: false, message: "User is already assigned." };

    await prisma.taskAssignee.create({
        data: { taskId, userId }
    });

    // Create assignments history via an internal comment!
    await addComment(taskId, `System: Assigned task to ${userName}`, true);

    return { success: true };
}

export async function updateTaskStatus(taskId: string, clientStatus: string, internalStatus?: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    // Clients cannot change internal status
    const dataToUpdate: any = { clientStatus };
    if (session.user.role !== "CLIENT" && internalStatus !== undefined) {
        dataToUpdate.internalStatus = internalStatus;
    }

    return prisma.task.update({
        where: { id: taskId },
        data: dataToUpdate
    });
}
