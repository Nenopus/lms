import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string ; chapterId: string} }
) {
  try {
    const { userId } = auth();
    if (!userId) {return new NextResponse("Unauthorized", { status: 401 });}

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          },
        },
      },
    });

    if (!ownCourse) return new NextResponse("Not Found", { status: 404 });

       
        const upublishedChapter = await db.chapter.update({
            where: {
                id: params.chapterId,
                courseId: params.courseId
              },
              data: {
                isPublished: false,
              }
            });
            const publishedChaptersInCourse = await db.chapter.findMany({
              where: {
                id: params.courseId,
                isPublished : true,
            }});
            if(!publishedChaptersInCourse.length){
              await db.course.update({
                where: {
                  id:params.courseId,
                },
                data: {
                  isPublished: false,
                }
              })
            }
            return NextResponse.json(upublishedChapter);
        }catch(error){
            console.log("[CHAPTER_UPUBLISH]", error);
            return new NextResponse("Internal Error" , { status: 500})
        }
        }
   
