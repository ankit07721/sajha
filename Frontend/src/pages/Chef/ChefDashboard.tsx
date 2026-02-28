import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChefHat, Utensils, Star, ShoppingBag, PlusCircle, Loader2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const fetchChefDashboard = async () => {
  const { data } = await api.get("/chef/dashboard");
  return data.data;
};

const ChefDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["chefDashboard"],
    queryFn: fetchChefDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const chef = data?.chef;
  const status = chef?.chefProfile?.applicationStatus;

  // If still pending
  if (status === "pending") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-black mb-3">Application Under Review</h1>
          <p className="text-muted-foreground mb-6">
            Hi <strong>{user?.firstName}</strong>! Your chef application is being reviewed by our admin team. This usually takes 24-48 hours.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
            You'll be able to access your full dashboard once approved!
          </div>
        </div>
      </div>
    );
  }

  // If rejected
  if (status === "rejected") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-black mb-3 text-red-600">Application Rejected</h1>
          <p className="text-muted-foreground mb-4">
            Unfortunately your application was not approved.
          </p>
          {chef?.chefProfile?.applicationNote && (
            <Alert className="mb-4">
              <AlertDescription>
                <strong>Reason:</strong> {chef.chefProfile.applicationNote}
              </AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">Please contact support for more information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 animate-fade-in">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">Chef Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, <span className="text-primary font-semibold">{user?.firstName} {user?.lastName}</span>! 👨‍🍳
            </p>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1.5">
            ✅ Approved Chef
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { title: "My Menu Items", value: data?.totalItems ?? 0,         icon: Utensils,   color: "text-orange-500" },
            { title: "Total Orders",  value: chef?.chefProfile?.totalOrders ?? 0, icon: ShoppingBag, color: "text-blue-500" },
            { title: "My Rating",     value: `${chef?.chefProfile?.rating?.toFixed(1) ?? "0.0"} ⭐`, icon: Star, color: "text-yellow-500" },
            { title: "Specialty",     value: chef?.chefProfile?.specialty ?? "—",  icon: ChefHat,    color: "text-primary" },
          ].map(stat => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-black">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/chef/add-item">
            <Card className="hover:bg-accent transition-colors cursor-pointer border-2 border-dashed border-primary/30 hover:border-primary">
              <CardContent className="flex items-center gap-3 p-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <PlusCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">Add New Dish</p>
                  <p className="text-xs text-muted-foreground">Add to your menu</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/chef/manage-menu">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 p-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Utensils className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold">Manage Menu</p>
                  <p className="text-xs text-muted-foreground">Edit or remove dishes</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/profile">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 p-6">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-bold">My Profile</p>
                  <p className="text-xs text-muted-foreground">Update bio & info</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/chef/orders">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 p-6">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-bold">My Orders</p>
                  <p className="text-xs text-muted-foreground">
                    View customer orders
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

        </div>

        {/* My Menu Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Menu Items</CardTitle>
            <Link to="/admin/add-item">
              <Button size="sm" className="gradient-primary">
                <PlusCircle className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.myItems?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Utensils className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No dishes yet!</p>
                <p className="text-sm mt-1">Click "Add Item" to create your first dish.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.myItems?.map((item: any) => (
                  <div key={item._id} className="flex items-center gap-3 p-3 border rounded-xl">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">NRs {item.price}</p>
                      <Badge className={`text-xs mt-1 ${item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <Link to={`/chef/edit-item/${item._id}`}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ChefDashboard;   