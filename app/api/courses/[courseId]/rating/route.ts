import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { rating, message } = await req.json();

    // Check if the user has already rated this course
    const existingRating = await db.rating.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        },
      },
    });

    if (existingRating) {
      return new NextResponse("You have already rated this course", { status: 400 });
    }

    // Create a new rating
    await db.rating.create({
      data: {
        userId,
        courseId: params.courseId,
        rating,
        message,
      },
    });

    return NextResponse.json({ message: "Rating submitted successfully" });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
