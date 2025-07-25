// prisma/seed.ts
import { PrismaClient, Prisma } from "../app/generated/prisma";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
    {
        email: 'alice@prisma.io',
        name: 'Alice',
        password: 'hashedPassword', // Ensure you hash the password
        profilePicture: ''
    },
    {
        email: 'bob@prisma.io',
        name: 'Bob',
        password: 'hashedPassword', // Ensure you hash the password
        profilePicture: ''

    },
];

export async function main() {
    for (const u of userData) {
        await prisma.user.create({ data: u });
    }
}

main();