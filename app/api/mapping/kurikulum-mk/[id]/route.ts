import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { type Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

type User = {
  id: string;
  roles?: string[];
  // Add other properties from your NextAuth user object as needed
};

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session.user as User;
    if (!user.roles || (!user.roles.includes("admin") && !user.roles.includes("prodi"))) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if mapping exists
    const existingMapping = await prisma.kURIKULUM_MK_MAPPING.findUnique({
      where: { id },
    });

    if (!existingMapping) {
      return NextResponse.json(
        { error: "Mapping not found" },
        { status: 404 }
      );
    }

    // Delete the mapping
    await prisma.kURIKULUM_MK_MAPPING.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Mapping deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[KURIKULUM-MK DELETE ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}