import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
        age: number;
        gender: string;
        profilePicture: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    pagination: Pagination;
}

export async function GET(request: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = request.nextUrl.searchParams;
        const searchTerm = searchParams.get("q")?.toString();
        const page = parseInt(searchParams.get("page") || "1") || 1;
        const pageSize = parseInt(searchParams.get("limit") || "10") || 10;

        if (!searchTerm) {
            return NextResponse.json(
                { error: "Search query parameter 'q' is required" },
                { status: 400 }
            );
        }

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

        const skip = (page - 1) * pageSize;

        // Search users with Prisma
        const [users, totalItems] = await Promise.all([
            prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: "insensitive" } },
                        { email: { contains: searchTerm, mode: "insensitive" } },
                    ],
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
                orderBy: { name: "asc" },
            }),
            prisma.user.count({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: "insensitive" } },
                        { email: { contains: searchTerm, mode: "insensitive" } },
                    ],
                },
            }),
        ]);

        const totalPages = Math.ceil(totalItems / pageSize);

        const response: ResponseData = {
            users,
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages,
            },
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error searching users:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}