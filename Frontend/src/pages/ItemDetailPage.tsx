import ReviewForm from "@/components/ReviewForm"; 
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star, Clock, ShoppingCart, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { MenuItem, Review } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { format } from "date-fns";

const fetchMenuItem = async (id: string): Promise<MenuItem> => {
  const { data } = await api.get(`/menu/${id}`);
  return data.data;
};

const fetchItemReviews = async (id: string): Promise<Review[]> => {
  const { data } = await api.get(`/reviews/${id}`);
  return data.data;
};

const ItemDetailPage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const { addToCart } = useCart();

  const { data: item, isLoading: isItemLoading } = useQuery({
    queryKey: ["menuItem", itemId],
    queryFn: () => fetchMenuItem(itemId!),
    enabled: !!itemId,
  });

  const { data: reviews, isLoading: areReviewsLoading } = useQuery({
    queryKey: ["reviews", itemId],
    queryFn: () => fetchItemReviews(itemId!),
    enabled: !!itemId,
  });

  if (isItemLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );

  if (!item)
    return (
      <div className="text-center py-20">
        <h2>Item not found</h2>
      </div>
    );

  return (
    <div className="container mx-auto py-12 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <img
            src={item.image}
            alt={item.name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        <div>
          <Badge
            variant={item.category === "veg" ? "secondary" : "default"}
            className="mb-2"
          >
            {item.category}
          </Badge>
          <h1 className="text-4xl font-bold mb-4">{item.name}</h1>
          <div className="flex items-center gap-4 mb-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span>
                {(item.rating?.average ?? 0).toFixed(1)} (
                {item.rating?.count ?? 0} reviews)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-5 w-5" />
              <span>{item.preparationTime} mins</span>
            </div>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            {item.description}
          </p>
          <p className="text-4xl font-bold text-primary mb-6">
            NRs {item.price}
          </p>
          <Button
            size="lg"
            className="w-full gradient-primary"
            onClick={() => {
              addToCart({ menuItemId: item._id, quantity: 1 });
              toast.success(`${item.name} added to cart!`);
            }}
          >
            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
          </Button>
          <div className="mt-6 space-y-2 text-sm">
            {item.ingredients && (
              <p>
                <strong>Ingredients:</strong> {item.ingredients.join(", ")}
              </p>
            )}
            {item.allergens && item.allergens.length > 0 && (
              <p>
                <strong>Allergens:</strong>{" "}
                <span className="text-destructive font-medium">
                  {item.allergens.join(", ")}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6">Reviews</h2>
        <ReviewForm menuItemId={itemId!}/>
        {areReviewsLoading ? (
          <p>Loading reviews...</p>
        ) : (
          <div className="space-y-6">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review._id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold">
                        {review.user.firstName} {review.user.lastName.charAt(0)}
                        .
                      </p>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>No reviews yet. Be the first to leave one!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetailPage;
