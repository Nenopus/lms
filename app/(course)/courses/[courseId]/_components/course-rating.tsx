"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Rating from '@mui/material/Rating';

interface CourseRatingProps {
  courseId: string;
}

export const CourseRating: React.FC<CourseRatingProps> = ({ courseId }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [isEligible, setIsEligible] = useState<boolean>(false);

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const response = await axios.get(`/api/courses/${courseId}/checkrate`);
        const { hasPurchased, hasCompletedChapter, hasRated } = response.data;
        if (hasPurchased && hasCompletedChapter) {
          setIsEligible(true);
          if (hasRated) {
            setHasRated(true);
          }
        }
      } catch (error) {
        console.error("Error checking eligibility:", error);
      }
    };
    checkEligibility();
  }, [courseId]);

  const handleRatingSubmit = async () => {
    if (rating === null) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(`/api/courses/${courseId}/rating`, { rating, message });
      toast.success("Rating submitted successfully");
      setRating(null);
      setMessage('');
      setHasRated(true); // Set hasRated to true after successful submission
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error("You have already rated this course");
        setHasRated(true); // Set hasRated to true if the user has already rated
      } else {
        toast.error("Failed to submit rating");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEligible) {
    return null;
  }

  if (hasRated) {
    return <div className="p-4">Thank you for your rating!</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Rate this Course</h2>
      <Rating
        name="course-rating"
        value={rating}
        onChange={(event, newValue) => setRating(newValue)}
      />
      <textarea
        className="w-full mt-2 p-2 border rounded-md"
        rows={4}
        placeholder="Leave a message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        className="mt-2"
        onClick={handleRatingSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Rating"}
      </Button>
    </div>
  );
};
