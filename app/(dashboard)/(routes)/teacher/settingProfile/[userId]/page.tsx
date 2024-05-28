import { db } from "@/lib/db";
import EditProfilePage from "./EditProfilePage";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

// Define the type for params
interface Params {
  userId: string;
}

export default async function EditProfilePageWrapper({ params }: { params: Params }) {
  const { userId } = params;
  
  const { userId: authUserId } = auth();

  if (!authUserId) {
    return redirect("/");
  }

  if (authUserId !== userId) {
    return notFound();
  }

  const profile = await db.profile.findUnique({
    where: { userId },
  });

  const initialData = {
    bio: profile?.bio || "",
    bannerImageUrl: profile?.bannerImageUrl || "",
    cvUrl: profile?.cvUrl || "",
  };

  return <EditProfilePage initialData={initialData} userId={userId} />;
}
