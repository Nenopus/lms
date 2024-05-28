"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageIcon, Pencil, PlusCircle, File } from "lucide-react";
import { FileUpload } from "@/components/file-upload";
import { BioForm } from "../_components/bio-form"; // Adjust the import path as needed

interface ProfileUpdateFormProps {
  initialData: {
    bio: string;
    bannerImageUrl: string;
    cvUrl: string;
  };
  userId: string;
}

const formSchema = z.object({
  bio: z.string().min(1, { message: "Bio is required" }),
  bannerImageUrl: z.string().min(1, { message: "Banner image is required" }),
  cvUrl: z.string().min(1, { message: "CV is required" }),
});

const EditProfilePage = ({ initialData, userId }: ProfileUpdateFormProps) => {
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [isEditingCV, setIsEditingCV] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleEditBanner = () => setIsEditingBanner((current) => !current);
  const toggleEditCV = () => setIsEditingCV((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await axios.patch(`/api/profile/${userId}`, values);
      toast.success("Profile updated");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Edit Profile</h1>
          <span className="text-sm text-slate-700">Customize your profile information</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        <div className="space-y-6">
          <BioForm initialData={{ bio: initialData.bio }} userId={userId} />

          <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <ImageIcon className="h-4 w-4" />
                <h2 className="text-xl">Banner Image</h2>
              </div>
              <Button onClick={toggleEditBanner} variant="ghost" disabled={isLoading}>
                {isEditingBanner ? "Cancel" : initialData.bannerImageUrl ? "Edit image" : "Add an image"}
              </Button>
            </div>
            {!isEditingBanner && (
              initialData.bannerImageUrl ? (
                <div className="relative aspect-video mt-2">
                  <Image alt="Upload" fill className="object-cover rounded-md" src={initialData.bannerImageUrl} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
                  <ImageIcon className="h-10 w-10 text-slate-500" />
                </div>
              )
            )}
            {isEditingBanner && (
              <div>
                <FileUpload
                  endpoint="bannerImage"
                  onChange={(url) => {
                    if (url) {
                      onSubmit({
                        bio: initialData.bio,
                        bannerImageUrl: url,
                        cvUrl: initialData.cvUrl,
                      });
                      toggleEditBanner();
                    }
                  }}
                />
                <div className="text-xs text-muted-foreground mt-4">16:9 aspect ratio recommended</div>
              </div>
            )}
          </div>

          <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <File className="h-4 w-4" />
                <h2 className="text-xl">CV</h2>
              </div>
              <Button onClick={toggleEditCV} variant="ghost" disabled={isLoading}>
                {isEditingCV ? "Cancel" : initialData.cvUrl ? "Edit CV" : "Add CV"}
              </Button>
            </div>
            {!isEditingCV && (
              initialData.cvUrl ? (
                <div className="relative mt-2">
                  <Button>
                  <a href={initialData.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-x-2 text-white">
                    <File className="h-4 w-4" />
                    Download CV
                  </a>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
                  <ImageIcon className="h-10 w-10 text-slate-500" />
                </div>
              )
            )}
            {isEditingCV && (
              <div>
                <FileUpload
                  endpoint="cv"
                  onChange={(url) => {
                    if (url) {
                      onSubmit({
                        bio: initialData.bio,
                        bannerImageUrl: initialData.bannerImageUrl,
                        cvUrl: url,
                      });
                      toggleEditCV();
                    }
                  }}
                />
                <div className="text-xs text-muted-foreground mt-4">PDF format recommended</div>
              </div>
            )}
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default EditProfilePage;
