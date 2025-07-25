import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // <-- note the Promise
) {
  try {
    // Await params before using its properties
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
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
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/user/[id]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        age: body.age,
        gender: body.gender,
        profilePicture: body.profilePicture || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/user/[id]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}