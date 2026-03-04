"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";

async function getSession() {
    return await getServerSession(authOptions);
}

export async function getComments(taskId: string) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const comments = await prisma.comment.findMany({
        where: { taskId },
        orderBy: { createdAt: "desc" },
        include: {
            author: { select: { name: true, role: true } }
        }
    });

    // Role-based filtering: Clients cannot see internal comments
    if (session.user.role === "CLIENT") {
        return comments.filter(c => !c.isInternal);
    }

    return comments;
}

export async function addComment(taskId: string, content: string, isInternal: boolean = false) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    // Clients cannot create internal comments
    const finalIsInternal = session.user.role === "CLIENT" ? false : isInternal;

    const comment = await prisma.comment.create({
        data: {
            taskId,
            authorId: session.user.id,
            content,
            isInternal: finalIsInternal
        }
    });

    if (session.user.role === "CLIENT") {
        await prisma.task.update({
            where: { id: taskId },
            data: { clientStatus: "Submitted / Client Reply" }
        });
    }

    return comment;
}
