import { Heart, Users, Award, Clock, ChefHat, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Made with Love",
      description:
        "Every dish is prepared with genuine care and passion by home cooks who love what they do.",
    },
    {
      icon: Users,
      title: "Community First",
      description:
        "We're building a community that celebrates home cooking and brings neighbors together through food.",
    },
    {
      icon: Award,
      title: "Quality Promise",
      description:
        "We maintain the highest standards for food safety, freshness, and taste in every meal.",
    },
    {
      icon: Clock,
      title: "Fresh Daily",
      description:
        "All meals are prepared fresh daily to ensure maximum flavor and quality.",
    },
  ];

  // const team = [
  //   {
  //     name: "Bhawana Chhetri",
  //     role: "Co-Founder & Lead Strategist",
  //     image:
  //       "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500",
  //     bio: "Driving the vision to connect communities through the universal language of food.",
  //   },
  //   {
  //     name: "Smriti Regmi",
  //     role: "Co-Founder & Head of Operations",
  //     image:
  //       "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500",
  //     bio: "Ensuring every meal is a perfect experience, from the kitchen to your doorstep.",
  //   },
  //   {
  //     name: "Santoshi Pandey",
  //     role: "Co-Founder & Technology Lead",
  //     image:
  //       "https://images.unsplash.com/photo-1602233158242-3ba0ac4d2167?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnQlMjBnaXJsfGVufDB8fDB8fHww",
  //     bio: "Architecting the seamless platform that makes Plateful possible.",
  //   },
  // ];

  const stats = [
    { number: "10,000+", label: "Happy Customers" },
    { number: "4.9 / 5", label: "Average Rating" },
    { number: "1,000+", label: "Dishes Served Daily" },
    { number: "98%", label: "On-Time Delivery" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Hero Section */}
      <section className="gradient-hero py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Our Story
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Plateful was born from a simple belief: the best meals come from the
            heart. We're connecting passionate home cooks with food lovers in
            their community, creating a marketplace where every bite tells a
            story of tradition, love, and authentic flavor.
          </p>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <ChefHat className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Mission & Values
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're on a mission to celebrate home cooking. By providing a
              platform for home cooks to share their culinary talents, we're
              preserving family recipes and creating economic opportunities in
              local communities.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="food-card text-center p-6">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-16">
            Growing Together
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      {/* <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground text-lg">
              The passionate people behind Plateful
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card
                key={index}
                className="food-card text-center overflow-hidden"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Star className="h-16 w-16 text-primary-foreground mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Join the Plateful Family
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8">
              Whether you're a food lover looking for authentic meals or a home
              cook wanting to share your culinary passion, there's a place for
              you at Plateful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="shadow-warm"
              >
                <Link to="/menu">Order Your First Meal</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground  hover:bg-primary-foreground hover:text-primary"
              >
                <Link to="/contact">Become a Home Cook</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default About;
