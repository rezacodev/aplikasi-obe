import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { type Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const createMappingSchema = z.object({
  profil_lulusan_id: z.string().min(1, "Profil Lulusan ID required"),
  mata_kuliah_ids: z.array(z.string()).min(1, "At least one mata kuliah must be selected"),
});

// type CreateMappingInput = z.infer<typeof createMappingSchema>;

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
    const profil_lulusan_id = searchParams.get("profil_lulusan_id");

    if (!profil_lulusan_id) {
      return NextResponse.json(
        { error: "Profil Lulusan ID is required" },
        { status: 400 }
      );
    }

    // Get existing mappings for this Profil Lulusan
    const mappings = await prisma.pL_MK_MAPPING.findMany({
      where: { profil_lulusan_id },
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
    console.error("[PL-MK GET ERROR]", error);
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
    const { profil_lulusan_id, mata_kuliah_ids } = createMappingSchema.parse(body);

    // Use transaction: delete existing mappings and create new ones
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing mappings for this Profil Lulusan
      await tx.pL_MK_MAPPING.deleteMany({
        where: { profil_lulusan_id },
      });

      // Create new mappings
      const createdMappings = await tx.pL_MK_MAPPING.createMany({
        data: mata_kuliah_ids.map((mata_kuliah_id) => ({
          profil_lulusan_id,
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
    console.error("[PL-MK POST ERROR]", error);

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