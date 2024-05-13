"use client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import toast from "react-hot-toast";
import axios from "axios";

interface CourseProgressButtonProps {
  chapterId: string;
  courseId: string;
  isCompleted?: boolean;
  nextChapterId?: string;
}

export const CourseProgressButton = ({
  chapterId,
  courseId,
  isCompleted,
  nextChapterId,
}: CourseProgressButtonProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();

  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      await axios.put(
        `/api/courses/${courseId}/chapters/${chapterId}/progress`,
        {
          isCompleted: !isCompleted,
        }
      );

      if (!isCompleted && !nextChapterId) {
        confetti.onOpen();
      }

      if (!isCompleted && nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
      }

      toast.success("Chapter marked as completed");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong, please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isCompleted ? XCircle : CheckCircle;

  return (
    <Button
    type="button"
    variant={isCompleted ? "outline" : "success"}
      onClick={onClick}
      disabled={isLoading}
      className="w-full md:w-auto"
    >
      {isCompleted ? "Not Completed" : "Mark as complete"}
      <Icon className="h-4 w-4 ml-2" type="button" />
    </Button>
  );
};
