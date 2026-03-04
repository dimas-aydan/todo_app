import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting status migration...");

    const result = await prisma.task.updateMany({
        where: {
            clientStatus: "Submitted"
        },
        data: {
            clientStatus: "Submitted / Client Reply"
        }
    });

    console.log(`Successfully migrated ${result.count} tasks from "Submitted" to "Submitted / Client Reply".`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
