import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { type Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const createMappingSchema = z.object({
  kurikulum_id: z.string().min(1, "Kurikulum ID required"),
  mata_kuliah_ids: z.array(z.string()).min(1, "At least one mata kuliah must be selected"),
});

type User = {
  id: string;
  roles?: string[];
  // Add other properties from your NextAuth user object as needed
};

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const kurikulum_id = searchParams.get("kurikulum_id");

    if (!kurikulum_id) {
      return NextResponse.json(
        { error: "Kurikulum ID is required" },
        { status: 400 }
      );
    }

    // Get existing mappings for this Kurikulum
    const mappings = await prisma.kURIKULUM_MK_MAPPING.findMany({
      where: { kurikulum_id },
      include: {
        mata_kuliah: {
          select: {
            id: true,
            kode_mk: true,
            nama_mk: true,
          },
        },
      },
    });

    return NextResponse.json(mappings);
  } catch (error) {
    console.error("[KURIKULUM-MK GET ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { kurikulum_id, mata_kuliah_ids } = createMappingSchema.parse(body);

    // Use transaction: delete existing mappings and create new ones
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing mappings for this Kurikulum
      await tx.kURIKULUM_MK_MAPPING.deleteMany({
        where: { kurikulum_id },
      });

      // Create new mappings
      const createdMappings = await tx.kURIKULUM_MK_MAPPING.createMany({
        data: mata_kuliah_ids.map((mata_kuliah_id) => ({
          kurikulum_id,
          mata_kuliah_id,
        })),
      });

      return createdMappings;
    });

    return NextResponse.json(
      {
        message: "Mapping created successfully",
        count: result.count,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[KURIKULUM-MK POST ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}