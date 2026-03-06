import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Edit3,
  ImagePlus,
  IndianRupee,
  MapPin,
  Package,
  PhoneCall,
  Plus,
  RefreshCw,
  Sprout,
  Trash2,
  Upload,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "../hooks/useTranslation";
import { useAppStore } from "../stores/appStore";
import { createPost, updatePost, deletePost as deletePostApi, getAllPosts } from "../utils/api";

// ── Interest status badge ─────────────────────────────────────────────────
function StatusBadge({ status }) {
  const classes = {
    pending: "badge-pending",
    contacted: "badge-contacted",
    closed: "badge-closed",
  };
  const labels = {
    pending: "Pending",
    contacted: "Contacted",
    closed: "Closed",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${classes[status]}`}
    >
      {status === "pending" && <Clock className="w-2.5 h-2.5" />}
      {status === "contacted" && <PhoneCall className="w-2.5 h-2.5" />}
      {status === "closed" && <XCircle className="w-2.5 h-2.5" />}
      {labels[status]}
    </span>
  );
}

// ── Add/Edit listing form ─────────────────────────────────────────────────
function ListingForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}) {
  const { t } = useTranslation();
  const [cropName, setCropName] = useState(initial?.cropName ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [quantity, setQuantity] = useState(initial?.quantity ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imagePreview, setImagePreview] = useState(initial?.images?.[0] || initial?.imageUrl || "");
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result);
    };
    reader.readAsDataURL(file);
  }

  function validate() {
    const errs = {};
    if (!cropName.trim()) errs.cropName = "Crop name is required";
    if (!price || Number.isNaN(Number(price)) || Number(price) <= 0)
      errs.price = "Valid price required";
    if (!quantity.trim()) errs.quantity = "Quantity is required";
    if (!location.trim()) errs.location = "Location is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave({
      cropName: cropName.trim(),
      price: Number(price),
      quantity: quantity.trim(),
      location: location.trim(),
      description: description.trim(),
      imageFile: imageFile,
      status: "active",
    });
  }

  return (
    <div className="space-y-4">
      {/* Image upload */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <ImagePlus className="w-3.5 h-3.5" />
          {t("products.uploadImage")}
        </Label>
        <div className="relative">
          {imagePreview ? (
            <div className="relative h-36 rounded-xl overflow-hidden bg-muted">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImagePreview("")}
                className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed border-border bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Click to upload photo
              </span>
              <span className="text-xs text-muted-foreground/70 mt-0.5">
                JPG, PNG up to 5MB
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Crop name */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">
          {t("products.cropName")} *
        </Label>
        <Input
          placeholder={t("products.cropNamePlaceholder")}
          value={cropName}
          onChange={(e) => {
            setCropName(e.target.value);
            setErrors((prev) => ({ ...prev, cropName: "" }));
          }}
          className={errors.cropName ? "border-destructive" : ""}
        />
        {errors.cropName && (
          <p className="text-xs text-destructive">{errors.cropName}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Price */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1">
            <IndianRupee className="w-3 h-3" />
            Price (₹/kg) *
          </Label>
          <Input
            type="number"
            placeholder="e.g. 120"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              setErrors((prev) => ({ ...prev, price: "" }));
            }}
            className={errors.price ? "border-destructive" : ""}
          />
          {errors.price && (
            <p className="text-xs text-destructive">{errors.price}</p>
          )}
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1">
            <Package className="w-3 h-3" />
            {t("products.quantity")} *
          </Label>
          <Input
            placeholder={t("products.quantityPlaceholder")}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setErrors((prev) => ({ ...prev, quantity: "" }));
            }}
            className={errors.quantity ? "border-destructive" : ""}
          />
          {errors.quantity && (
            <p className="text-xs text-destructive">{errors.quantity}</p>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          {t("products.location")} *
        </Label>
        <Input
          placeholder="City / Village, State"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setErrors((prev) => ({ ...prev, location: "" }));
          }}
          className={errors.location ? "border-destructive" : ""}
        />
        {errors.location && (
          <p className="text-xs text-destructive">{errors.location}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">
          {t("products.description")}
        </Label>
        <Textarea
          placeholder={t("products.descriptionPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          {t("products.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSaving ? (
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            t("products.save")
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Main farmer dashboard ─────────────────────────────────────────────────
export default function FarmerDashboard() {
  const { t } = useTranslation();
  const {
    currentUser,
    products,
    setProducts,
    addProduct,
    updateProduct: updateProductStore,
    deleteProduct,
    interests,
    updateInterestStatus,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState("listings");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's posts from backend on mount
  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        setIsLoading(true);
        const data = await getAllPosts();
        if (data.success) {
          setProducts(data.posts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyPosts();
  }, []);

  const myProducts = products.filter(
    (p) => (p.userId?._id || p.userId) === currentUser?.id || p.farmerId === currentUser?.id
  );
  const myInterests = interests.filter((i) => i.farmerId === currentUser?.id);
  const pendingCount = myInterests.filter((i) => i.status === "pending").length;

  async function handleAddProduct(data) {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('cropName', data.cropName);
      formData.append('price', data.price);
      formData.append('quantity', data.quantity);
      formData.append('location', data.location);
      formData.append('description', data.description);
      if (data.imageFile) {
        formData.append('images', data.imageFile);
      }

      const result = await createPost(formData);
      if (result.success) {
        addProduct(result.post);
        toast.success(t("products.listingAdded"));
        console.log(`✅ Card data successfully saved to collection: farmer_post`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create listing');
    } finally {
      setIsSaving(false);
      setIsAddOpen(false);
    }
  }

  async function handleEditProduct(data) {
    if (!editProduct) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('cropName', data.cropName);
      formData.append('price', data.price);
      formData.append('quantity', data.quantity);
      formData.append('location', data.location);
      formData.append('description', data.description);
      if (data.imageFile) {
        formData.append('images', data.imageFile);
      }

      const postId = editProduct._id || editProduct.id;
      const result = await updatePost(postId, formData);
      if (result.success) {
        updateProductStore(postId, result.post);
        toast.success(t("products.listingUpdated"));
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update listing');
    } finally {
      setIsSaving(false);
      setEditProduct(null);
    }
  }

  async function handleDelete(id) {
    try {
      const result = await deletePostApi(id);
      if (result.success) {
        deleteProduct(id);
        toast.success(t("products.listingDeleted"));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete listing');
    } finally {
      setDeleteConfirm(null);
    }
  }

  async function handleMarkSold(id, status) {
    try {
      const formData = new FormData();
      formData.append('status', status);
      const result = await updatePost(id, formData);
      if (result.success) {
        updateProductStore(id, { status });
        toast.success(`Product marked as ${status}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  }

  return (
    <div className=" mx-auto px-4 sm:px-6 py-6 mt-20 flex-col" >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            {t("nav.dashboard")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, {currentUser?.name}
          </p>
        </div>
        {activeTab === "listings" && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t("products.addListing")}</span>
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Total Listings",
            value: myProducts.length,
            icon: <Sprout className="w-4 h-4 text-primary" />,
          },
          {
            label: "Active",
            value: myProducts.filter((p) => p.status === "active").length,
            icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
          },
          {
            label: "New Interests",
            value: pendingCount,
            icon: <Users className="w-4 h-4 text-farm-amber" />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4 text-center"
          >
            <div className="flex justify-center mb-1">{stat.icon}</div>
            <div className="font-display font-bold text-xl text-foreground">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="listings" className="flex-1">
            {t("products.myListings")}
            {myProducts.length > 0 && (
              <span className="ml-2 text-xs bg-muted rounded-full px-1.5 py-0.5">
                {myProducts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="add" className="flex-1">
            {t("products.addListing")}
          </TabsTrigger>
          <TabsTrigger value="interests" className="flex-1">
            {t("interests.noInterests").includes("No")
              ? "Received Interests"
              : t("interests.title")}
            {pendingCount > 0 && (
              <span className="ml-2 text-xs bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── My listings tab ──────────────────────────────────────── */}
        <TabsContent value="listings">
          {myProducts.length === 0 ? (
            <div className="text-center py-16 flex-row space-3">
              <div className="w-14 h-14 rounded-2xl bg-farm-green-pale flex items-center justify-center mx-auto">
                <Sprout className="w-7 h-7 text-primary/60" />
              </div>
              <p className="font-medium text-foreground">No listings yet</p>
              <p className="text-sm text-muted-foreground">
                Add your first product to start selling
              </p>
              <Button
                onClick={() => setIsAddOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 mt-2"
              >
                <Plus className="w-4 h-4" />
                {t("products.addListing")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 ">
              <AnimatePresence mode="popLayout">
                {myProducts.map((product) => (
                  <motion.div
                    key={product._id || product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -10 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-card border border-border/50 rounded-[2rem] p-5 flex gap-5 items-center hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-muted relative group-hover:scale-105 transition-transform duration-500">
                      <img
                        src={product.images?.[0] || product.imageUrl || "/artifacts/fresh_produce_basket_1772729731157.png"}
                        alt={product.cropName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f0fdf4'/%3E%3Ctext x='32' y='42' text-anchor='middle' font-size='28'%3E🌿%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                            {product.cropName}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                              <IndianRupee className="w-3 h-3 text-primary/60" />
                              {product.price}/kg
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Package className="w-3 h-3 text-primary/60" />
                              {product.quantity}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-primary/60" />
                              {(product.location || '').split(",")[0]}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`rounded-full px-3 py-1 font-bold ${product.status === "active"
                            ? "bg-emerald-50 text-white border-0"
                            : "bg-muted text-muted-foreground border-0"
                            }`}
                        >
                          {product.status === "active"
                            ? t("products.status.active")
                            : t("products.status.sold")}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-4 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-4 rounded-xl text-xs gap-1.5 font-bold border-2 hover:bg-muted"
                          onClick={() => setEditProduct(product)}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          {t("products.edit")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-4 rounded-xl text-xs gap-1.5 font-bold border-2 hover:bg-muted"
                          onClick={() =>
                            handleMarkSold(
                              product._id || product.id,
                              product.status === "active" ? "sold" : "active",
                            )
                          }
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          {product.status === "active"
                            ? t("products.markSold")
                            : t("products.markActive")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-4 rounded-xl text-xs gap-1.5 font-bold border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                          onClick={() => setDeleteConfirm(product._id || product.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {t("products.delete")}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* ── Add listing tab ──────────────────────────────────────── */}
        <TabsContent value="add">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-lg text-foreground mb-4">
              {t("products.addListing")}
            </h2>
            <ListingForm
              onSave={handleAddProduct}
              onCancel={() => setActiveTab("listings")}
              isSaving={isSaving}
            />
          </div>
        </TabsContent>

        {/* ── Received interests tab ───────────────────────────────── */}
        <TabsContent value="interests">
          {myInterests.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-farm-amber-pale flex items-center justify-center mx-auto">
                <Users className="w-7 h-7 text-farm-amber" />
              </div>
              <p className="font-medium text-foreground">
                {t("interests.noInterests")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("interests.noInterestsDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myInterests.map((interest) => (
                <motion.div
                  key={interest.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-farm-amber-pale flex items-center justify-center">
                          <span className="text-sm font-bold text-farm-amber">
                            {interest.buyerName[0]}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-sm text-foreground">
                            {interest.buyerName}
                          </span>
                          <div className="text-xs text-muted-foreground">
                            +91 {interest.buyerPhone}
                          </div>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={interest.status} />
                  </div>

                  <div className="text-xs text-muted-foreground mb-1 font-medium">
                    {interest.productName}
                  </div>
                  <p className="text-sm text-foreground bg-muted rounded-lg p-2.5 mb-3">
                    &ldquo;{interest.message}&rdquo;
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(interest.createdAt).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short" },
                      )}
                    </span>
                    {interest.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() =>
                            updateInterestStatus(interest.id, "contacted")
                          }
                        >
                          <PhoneCall className="w-3 h-3" />
                          {t("interests.markContacted")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() =>
                            updateInterestStatus(interest.id, "closed")
                          }
                        >
                          <XCircle className="w-3 h-3" />
                          {t("interests.close")}
                        </Button>
                      </div>
                    )}
                    {interest.status === "contacted" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() =>
                          updateInterestStatus(interest.id, "closed")
                        }
                      >
                        <XCircle className="w-3 h-3" />
                        {t("interests.close")}
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Add listing dialog ─────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {t("products.addListing")}
            </DialogTitle>
          </DialogHeader>
          <ListingForm
            onSave={handleAddProduct}
            onCancel={() => setIsAddOpen(false)}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>

      {/* ── Edit listing dialog ────────────────────────────────────── */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {t("products.edit")} Listing
            </DialogTitle>
          </DialogHeader>
          {editProduct && (
            <ListingForm
              initial={editProduct}
              onSave={handleEditProduct}
              onCancel={() => setEditProduct(null)}
              isSaving={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm dialog ──────────────────────────────────── */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <AlertCircle className="w-5 h-5 text-destructive" />
              {t("common.confirmDelete")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove the listing from the marketplace.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              {t("common.no")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              {t("common.yes")}, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
