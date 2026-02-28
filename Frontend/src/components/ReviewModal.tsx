// src/components/ReviewModal.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Order } from "@/types";
import api from "@/lib/api";

interface ReviewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const ReviewModal = ({ order, isOpen, onClose }: ReviewModalProps) => {
  const [reviews, setReviews] = useState<{
    [menuItemId: string]: { rating: number; comment: string };
  }>({});
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (reviewData: {
      orderId: string;
      menuItemId: string;
      rating: number;
      comment: string;
    }) => api.post("/reviews", reviewData),
    onSuccess: () => {
      toast.success("Thank you for your review!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit review.");
    },
  });

  const handleRating = (menuItemId: string, rating: number) => {
    setReviews((prev) => ({
      ...prev,
      [menuItemId]: { ...prev[menuItemId], rating },
    }));
  };

  const handleComment = (menuItemId: string, comment: string) => {
    setReviews((prev) => ({
      ...prev,
      [menuItemId]: { ...prev[menuItemId], comment },
    }));
  };

  const handleSubmit = (menuItemId: string) => {
    if (!order || !reviews[menuItemId]?.rating) {
      toast.error("Please select a rating.");
      return;
    }
    mutation.mutate({
      orderId: order._id,
      menuItemId,
      rating: reviews[menuItemId].rating,
      comment: reviews[menuItemId].comment || "",
    });
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            Rate the items from your order #{order.orderNumber}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {order.items.map((item) => (
            <div
              key={item.menuItem._id}
              className="space-y-2 border-b pb-4 last:border-b-0"
            >
              <h4 className="font-semibold">{item.name}</h4>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer transition-colors ${
                      (reviews[item.menuItem._id]?.rating || 0) >= star
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => handleRating(item.menuItem._id, star)}
                  />
                ))}
              </div>
              <Textarea
                placeholder="Optional: Share your thoughts..."
                value={reviews[item.menuItem._id]?.comment || ""}
                onChange={(e) =>
                  handleComment(item.menuItem._id, e.target.value)
                }
              />
              <Button
                onClick={() => handleSubmit(item.menuItem._id)}
                disabled={mutation.isPending}
                size="sm"
                className="w-full"
              >
                {mutation.isPending &&
                mutation.variables?.menuItemId === item.menuItem._id ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
