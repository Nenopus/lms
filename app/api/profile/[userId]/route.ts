import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(request: Request, { params }: { params: { userId: string } }) {
  const userId = params.userId;
  const { bio, description, bannerImageUrl, cvUrl } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const { userId: authUserId } = auth();
  if (authUserId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingProfile = await db.profile.findUnique({
      where: { userId },
    });

    let profile;
    if (existingProfile) {
      profile = await db.profile.update({
        where: { userId },
        data: {
          bio,
          bannerImageUrl,
          cvUrl,
        },
      });
    } else {
      profile = await db.profile.create({
        data: {
          userId,
          bio,
          bannerImageUrl,
          cvUrl,
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
