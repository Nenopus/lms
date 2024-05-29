import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the user has purchased the course
    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        },
      },
    });

    if (!purchase) {
      return NextResponse.json({ hasPurchased: false, hasCompletedChapter: false, hasRated: false });
    }

    // Check if the user has completed at least one chapter
    const completedChapter = await db.userProgress.findFirst({
      where: {
        userId,
        chapter: {
          courseId: params.courseId,
          isPublished: true,
        },
        isCompleted: true,
      },
    });

    const hasCompletedChapter = !!completedChapter;

    // Check if the user has already rated this course
    const existingRating = await db.rating.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        },
      },
    });

    const hasRated = !!existingRating;

    return NextResponse.json({ hasPurchased: true, hasCompletedChapter, hasRated });
  } catch (error) {
    console.error("Error checking rating eligibility:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
