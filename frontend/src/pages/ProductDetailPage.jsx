import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppStore } from "@/stores/appStore";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Scale,
  User,
  Calendar,
  MessageSquare,
  Share2,
  Heart,
  Loader2,
} from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingInterest, setSendingInterest] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await api.get(`/posts/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Could not load product details");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleExpressInterest = async () => {
    if (!currentUser) return toast.error("Please login to express interest");
    setSendingInterest(true);
    try {
      await api.post("/interests/create", {
        postId: id,
        farmerId: product.userId,
        message: `Hi, I'm interested in your ${product.cropName}.`,
      });
      toast.success(t("interests.interestSent"));
    } catch (error) {
      const msg = error.response?.data?.error || "Error expressing interest";
      toast.error(msg);
    } finally {
      setSendingInterest(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Button asChild variant="outline">
          <Link to="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    );

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("products.search")}
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[3/4] rounded-[2rem] overflow-hidden border-5 border-border shadow-md bg-muted">
            <img
              src={product.mediaUrls?.[0] || "/placeholder-crop.png"}
              alt={product.cropName}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {product.mediaUrls?.map((url, i) => (
              <div
                key={i}
                className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer flex-shrink-0 transition-all"
              >
                <img
                  src={url}
                  alt={`Gallery ${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="inline-flex gap-2">
              <Badge
                variant="outline"
                className={`rounded-full px-4 py-1.5 ${product.status === "active" ? "bg-farm-green/10 text-farm-green" : "bg-farm-amber/10 text-farm-earth"}`}
              >
                {product.status === "active"
                  ? t("products.status.active")
                  : t("products.status.sold")}
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full px-4 py-1.5 bg-muted/50"
              >
                {product.location}
              </Badge>
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold leading-tight">
              {product.cropName}
            </h1>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">
                ₹{product.price}
              </span>
              <span className="text-muted-foreground text-lg uppercase font-medium">
                {t("products.pricePerKg")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-6 rounded-3xl bg-muted/30 border border-border/50">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <Scale className="w-4 h-4" />
                {t("products.quantity")}
              </div>
              <p className="font-bold text-lg">{product.quantity}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <MapPin className="w-4 h-4" />
                {t("products.location")}
              </div>
              <p className="font-bold text-lg">{product.location}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">{t("products.description")}</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {product.description || "No description provided for this crop."}
            </p>
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-4 items-center sm:items-stretch">
            <Button
              onClick={handleExpressInterest}
              disabled={
                sendingInterest ||
                product.status !== "active" ||
                currentUser?._id === product.userId
              }
              className="flex-1 h-16 rounded-2xl text-lg font-bold gap-3 shadow-xl shadow-primary/20"
            >
              {sendingInterest ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
              {t("products.interested")}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="w-16 h-16 rounded-2xl border-2 hover:bg-muted"
              >
                <Heart className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-16 h-16 rounded-2xl border-2 hover:bg-muted"
              >
                <Share2 className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Seller Card */}
          <div className="mt-8 p-6 rounded-3xl border border-border bg-card shadow-sm flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {product.userName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                Seller Information
              </p>
              <h4 className="font-bold text-lg">{product.userName}</h4>
              <p className="text-sm text-muted-foreground">
                Trusted seller in {product.location}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full px-4 h-9">
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
