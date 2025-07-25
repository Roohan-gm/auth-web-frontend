import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Pagination {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

interface ResponseData {
    users: Array<{
        id: string;
        name: string;
        email: string;
        age?: number;
        gender?: string;
        profilePicture?: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    pagination: Pagination;
}

export async function GET(request: NextRequest) {
    try {

        // Get the current user's session
        const session = await getServerSession(authOptions);
        if (!session || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract query parameters
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1") || 1;
        const pageSize = parseInt(searchParams.get("limit") || "10") || 10;
        const sort = searchParams.get("sort") || "createdAt";
        const order = searchParams.get("order") || "desc";

        // Validate pagination parameters
        if (page < 1 || isNaN(page)) {
            return NextResponse.json(
                { error: "Invalid page number" },
                { status: 400 }
            );
        }
        if (pageSize < 1 || pageSize > 100 || isNaN(pageSize)) {
            return NextResponse.json(
                { error: "Invalid page size (must be between 1 and 100)" },
                { status: 400 }
            );
        }

        // Validate sort field
        const validSortFields = ["id", "name", "email", "createdAt", "updatedAt"];
        if (!validSortFields.includes(sort)) {
            return NextResponse.json(
                { error: `Invalid sort field. Must be one of: ${validSortFields.join(", ")}` },
                { status: 400 }
            );
        }

        // Validate order
        if (!["asc", "desc"].includes(order)) {
            return NextResponse.json(
                { error: "Invalid order. Must be 'asc' or 'desc'" },
                { status: 400 }
            );
        }

        const skip = (page - 1) * pageSize;

        // Fetch users with Prisma
        const [users, totalItems] = await Promise.all([
            prisma.user.findMany({
                where: {
                    id: { not: session.user.id }, // Exclude current user
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    age: true,
                    gender: true,
                    profilePicture: true,
                    createdAt: true,
                    updatedAt: true,
                },
                skip,
                take: pageSize,
                orderBy: { [sort]: order },
            }),
            prisma.user.count({
                where: {
                    id: { not: session.user.id }, // Exclude current user
                },
            }),
        ]);

        // Transform users to match ResponseData (convert null to undefined)
        const transformedUsers = users.map((user) => ({
            ...user,
            profilePicture: user.profilePicture ?? undefined,
            age: user.age ?? undefined,
            gender: user.gender ?? undefined,
        }));

        const totalPages = Math.ceil(totalItems / pageSize);

        const response: ResponseData = {
            users: transformedUsers,
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages,
            },
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}