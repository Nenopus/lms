import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import React from "react";
import {Button} from "@/components/ui/button";
import {  File } from "lucide-react";

import { getUserCourses } from "@/actions/get-user-courses";
import { CoursesList } from "@/components/courses-list"; // Adjust the import path based on your file structure

type ProfileProps = {
  params: {
    userId: string;
  };
};

const fetchUserAndCourses = async (userId: string) => {
  try {
    // Fetch the user details from Clerk
    const user = await clerkClient.users.getUser(userId);
    if (!user) {
      return null;
    }

    // Fetch the user's courses
    const courses = await getUserCourses({ userId });

    // Fetch the profile details from the database
    const profile = await db.profile.findUnique({
      where: { userId },
    });

    return {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddresses: user.emailAddresses,
        imageUrl: user.imageUrl,
      },
      courses,
      profile,
    };
  } catch (error) {
    console.error("Error fetching user and courses:", error);
    return null;
  }
};

const Profile = async ({ params }: ProfileProps) => {
  const data = await fetchUserAndCourses(params.userId);

  if (!data) {
    return <div>User not found</div>;
  }

  const { user, courses, profile } = data;
  const fullName = `${user.firstName} ${user.lastName}`;
  const email = user.emailAddresses[0]?.emailAddress || "No email available";
  const imageUrl = user.imageUrl || "/default-avatar.png"; // Use a default image if none is provided

  return (
    <div>
      {profile?.bannerImageUrl && (
        <div className="w-full h-64 relative">
          <img
            src={profile.bannerImageUrl}
            alt="Banner Image"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col items-center p-4">
        <img
          src={imageUrl}
          alt={fullName}
          className="w-32 h-32 rounded-full mb-4"
        />
        <h1 className="text-2xl font-semibold">{fullName}</h1>
        <p className="text-gray-600">{email}</p>
        {profile?.bio && (
          <p className="text-center mt-4 max-w-2xl">{profile.bio}</p>
        )}
        {profile?.cvUrl && (
          <div className="relative mt-2">
          <Button>
          <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-x-2 text-white">
            <File className="h-4 w-4" />
            Download CV
          </a>
          </Button>
        </div>
         
        )}
        <h2 className="text-xl font-semibold mt-6">Courses</h2>
      </div>
      <div className="p-6 space-y-4">
        <CoursesList items={courses} />
      </div>
    </div>
  );
};

export default Profile;
