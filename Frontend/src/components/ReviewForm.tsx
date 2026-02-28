// Frontend/src/components/ReviewForm.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  menuItemId: string;
}

// Fetch user's delivered orders that contain this menu item
// so we can get the orderId — required by your backend POST /api/reviews
const fetchEligibleOrders = async (menuItemId: string) => {
  const { data } = await api.get("/orders/my-orders");
  const orders = data.data ?? [];

  // Only delivered orders that contain this menu item
  return orders.filter(
    (order: any) =>
      order.status === "delivered" &&
      order.items.some(
        (i: any) =>
          i.menuItem === menuItemId ||
          i.menuItem?._id === menuItemId
      )
  );
};

const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function ReviewForm({ menuItemId }: Props) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  // Check if user has a delivered order with this item
  const { data: eligibleOrders, isLoading: checkingOrders } = useQuery({
    queryKey: ["eligibleOrders", menuItemId],
    queryFn: () => fetchEligibleOrders(menuItemId),
    enabled: isAuthenticated && !!menuItemId,
  });

  // Submit review — matches YOUR backend exactly:
  // POST /api/reviews with body: { orderId, menuItemId, rating, comment }
  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: async () => {
      const orderId = eligibleOrders?.[0]?._id;
      if (!orderId) throw new Error("No eligible order");

      const { data } = await api.post("/reviews", {
        orderId,
        menuItemId,
        rating,
        comment,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      // This refreshes the review list already in ItemDetailPage
      queryClient.invalidateQueries({ queryKey: ["reviews", menuItemId] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? "Failed to submit review."
      );
    },
  });

  const handleSubmit = () => {
    if (rating === 0) return toast.error("Please select a star rating.");
    if (comment.trim().length < 3) return toast.error("Please write a short comment.");
    submitReview();
  };

  // ── Case 1: Not logged in ──────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Card className="mb-6">
        <CardContent className="p-5 text-center text-muted-foreground text-sm">
          🔐 Please{" "}
          <a href="/login" className="text-primary font-semibold hover:underline">
            login
          </a>{" "}
          to write a review.
        </CardContent>
      </Card>
    );
  }

  // ── Case 2: Still checking orders ─────────────────────────────
  if (checkingOrders) {
    return (
      <Card className="mb-6">
        <CardContent className="p-5 text-sm text-muted-foreground">
          Checking your order history...
        </CardContent>
      </Card>
    );
  }

  // ── Case 3: User never ordered this item ──────────────────────
  if (!eligibleOrders || eligibleOrders.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="p-5 text-center text-sm text-muted-foreground">
          🍽️ You can only review items you have ordered and received.
        </CardContent>
      </Card>
    );
  }

  // ── Case 4: Show the form ──────────────────────────────────────
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-5">✍️ Write a Review</h3>

        {/* Star Rating */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-muted-foreground mb-2">
            Your Rating
          </p>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-all duration-150 ${
                    star <= (hovered || rating)
                      ? "text-yellow-400 fill-current scale-110"
                      : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                />
              ))}
            </div>
            {rating > 0 && (
              <span className="text-sm font-bold text-primary">
                {ratingLabels[rating]}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-muted-foreground mb-2">
            Your Comment
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            placeholder="What did you like about this dish?"
            rows={3}
            className="w-full p-3 border-2 rounded-lg text-sm resize-y outline-none 
                       focus:border-primary border-border transition-colors font-sans"
          />
          <p className="text-xs text-muted-foreground text-right mt-1">
            {comment.length}/500
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full gradient-primary"
          size="lg"
        >
          {isPending ? "Submitting..." : "Submit Review ★"}
        </Button>
      </CardContent>
    </Card>
  );
}