import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log(`Start seeding new users...`)

    const project = await prisma.project.findFirst();
    if (!project) throw new Error("No project found to assign users to.");

    const dimas = await prisma.user.upsert({
        where: { email: 'dimas@agency.com' },
        update: {},
        create: {
            email: 'dimas@agency.com',
            name: 'Dimas',
            role: 'TEAM',
        },
    })

    const aydan = await prisma.user.upsert({
        where: { email: 'aydan@agency.com' },
        update: {},
        create: {
            email: 'aydan@agency.com',
            name: 'Aydan',
            role: 'TEAM',
        },
    })

    // Ensure they are members of the core project
    await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId: project.id, userId: dimas.id } },
        update: {},
        create: { projectId: project.id, userId: dimas.id }
    })

    await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId: project.id, userId: aydan.id } },
        update: {},
        create: { projectId: project.id, userId: aydan.id }
    })

    console.log(`Seeding users finished. Added Dimas and Aydan.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
