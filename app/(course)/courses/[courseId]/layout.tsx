import React from "react";
import { db } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProgress } from "@/actions/get-progress";
import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavBar } from "./_components/course-navbar";
import Link from 'next/link';

const Courselayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          userProgress: {
            where: {
              userId,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  // Fetch teacher (user who published the course) details
  const teacher = await clerkClient.users.getUser(course.userId);

  if (!teacher) {
    return redirect("/");
  }

  const teacherFullName = `${teacher.firstName} ${teacher.lastName}`;
  const teacherEmail = teacher.emailAddresses[0]?.emailAddress;
  const teacherProfileImageUrl = teacher.imageUrl; // Adjust if necessary

  const progressCount = await getProgress(userId, course.id);

  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavBar course={course} progressCount={progressCount} />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar course={course} progressCount={progressCount} />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">
        <div className="p-4 flex items-center space-x-4">
          <Link href={`/profile/${course.userId}`}>
            <div className="flex items-center space-x-4 cursor-pointer">
              {teacherProfileImageUrl && (
                <img
                  src={teacherProfileImageUrl}
                  alt={teacherFullName}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold">{teacherFullName}</h2>
                <p className="text-gray-600">{teacherEmail}</p>
              </div>
            </div>
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Courselayout;
