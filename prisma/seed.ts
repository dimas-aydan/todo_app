import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // 1. Create Core Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@agency.com' },
    update: {},
    create: {
      email: 'admin@agency.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })
  
  const teamMember = await prisma.user.upsert({
    where: { email: 'team@agency.com' },
    update: {},
    create: {
      email: 'team@agency.com',
      name: 'Team Member',
      role: 'TEAM',
    },
  })

  // 2. Create Clients
  const client1 = await prisma.user.upsert({
    where: { email: 'client1@clientcorp.com' },
    update: {},
    create: {
      email: 'client1@clientcorp.com',
      name: 'Client One',
      role: 'CLIENT',
    },
  })

  // 3. Create a Project
  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Redesigning the corporate website for ClientCorp.',
    },
  })

  // 4. Map Users to Project
  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: admin.id },
      { projectId: project.id, userId: teamMember.id },
      { projectId: project.id, userId: client1.id },
    ],
  })

  // 5. Create some initial tasks
  const task1 = await prisma.task.create({
    data: {
      projectId: project.id,
      title: 'Design New Homepage',
      description: 'Create high-fidelity mockups for the new homepage.',
      clientStatus: 'In Progress',
      internalStatus: 'Development',
      timeEstimate: 600, // 10 hours
      assignees: {
        create: [
          { userId: teamMember.id }
        ]
      }
    },
  })

  const task2 = await prisma.task.create({
    data: {
      projectId: project.id,
      title: 'Review Brand Guidelines',
      description: 'Client needs to upload the latest PDF guidelines.',
      clientStatus: 'Submitted',
      internalStatus: 'Triage',
    },
  })

  // 6. Add some comments
  await prisma.comment.createMany({
    data: [
      {
        taskId: task1.id,
        authorId: teamMember.id,
        content: 'I have started on the hero section.',
        isInternal: false,
      },
      {
        taskId: task1.id,
        authorId: teamMember.id,
        content: 'Note to self: Ask admin about the missing logo files before the client meeting tomorrow.',
        isInternal: true, // Internal only!
      },
    ]
  })

  console.log(`Seeding finished.`)
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
