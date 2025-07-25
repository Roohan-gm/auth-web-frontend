import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; 
import bcrypt from "bcryptjs";
import prisma  from "@/lib/prisma";


export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  });

  // User exists AND has a password?
  if (!user || !user.password) {
    return NextResponse.json(
      { message: "User not found or password not set" },
      { status: 400 }
    );
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return NextResponse.json(
      { message: "Current password is incorrect" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return NextResponse.json({ message: "Password updated" });
}