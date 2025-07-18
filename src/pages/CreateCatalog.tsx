import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Eye, Save } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "../supabaseClient";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
}

const CreateCatalog = () => {
  const navigate = useNavigate();
  const [catalogName, setCatalogName] = useState("");
  const [catalogDescription, setCatalogDescription] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [slug, setSlug] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product>({
    id: "",
    name: "",
    description: "",
    price: "",
    image: ""
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
  
    const { data, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);
  
    if (uploadError) {
      toast({ title: "Upload Failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }
  
    const { data: publicUrlData } = supabase
      .storage
      .from("product-images")
      .getPublicUrl(filePath);
  
    const publicUrl = publicUrlData?.publicUrl;
    console.log("✅ Public URL Generated:", publicUrl);
  
    if (!publicUrl) {
      toast({ title: "Could not generate image URL", variant: "destructive" });
      setUploading(false);
      return;
    }
  
    setCurrentProduct((prev) => ({ ...prev, image: publicUrl }));
    toast({ title: "Image Uploaded" });
    setUploading(false);
  };
  
  const addProduct = () => {
    if (!currentProduct.name || !currentProduct.price) {
      toast({ title: "Missing Info", description: "Product name and price required", variant: "destructive" });
      return;
    }

    if (!currentProduct.image) {
      toast({ title: "Image Missing", description: "Upload an image before adding the product", variant: "destructive" });
      return;
    }

    const newProduct = { ...currentProduct, id: Date.now().toString() };
    setProducts([...products, newProduct]);
    setCurrentProduct({ id: "", name: "", description: "", price: "", image: "" });

    if (fileInputRef.current) fileInputRef.current.value = "";

    toast({ title: "Product Added" });
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const saveCatalog = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      toast({ title: "Unauthorized", description: "Please log in again.", variant: "destructive" });
      return;
    }

    if (!slug.trim()) {
      toast({ title: "Missing Slug", description: "Please enter a URL-friendly name.", variant: "destructive" });
      return;
    }

    const { data: existingSlug, error: slugError } = await supabase
      .from("catalogs")
      .select("id")
      .eq("slug", slug);

    if (slugError) {
      toast({ title: "Error checking slug", description: slugError.message, variant: "destructive" });
      return;
    }

    if (existingSlug && existingSlug.length > 0) {
      toast({ title: "Slug Already Taken", description: "Please choose a different URL name.", variant: "destructive" });
      return;
    }

    if (products.length === 0) {
      toast({ title: "No Products", description: "Add at least one product before saving.", variant: "destructive" });
      return;
    }

    if (products.some(p => !p.image)) {
      toast({ title: "Missing Product Image", description: "All products must have images.", variant: "destructive" });
      return;
    }

    const { data: catalogData, error: catalogError } = await supabase
      .from("catalogs")
      .insert([{
        user_id: user.id,
        name: catalogName,
        description: catalogDescription,
        whatsapp: whatsappNumber,
        slug,
        is_live: true
      }])
      .select()
      .single();

    if (catalogError) {
      toast({ title: "Catalog Error", description: catalogError.message, variant: "destructive" });
      return;
    }

    const productInserts = products.map(product => ({
      catalog_id: catalogData.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      image_url: product.image
    }));

    const { error: productError } = await supabase
      .from("products")
      .insert(productInserts);

    if (productError) {
      toast({ title: "Product Save Failed", description: productError.message, variant: "destructive" });
      return;
    }

    toast({ title: "Catalog Created", description: "Your catalog was saved successfully." });
    navigate("/dashboard");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Create New Catalog</h1>
        <p className="text-slate-600">Build your product catalog step by step</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Catalog Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Label>Catalog Name</Label>
              <Input value={catalogName} onChange={(e) => setCatalogName(e.target.value)} />
              <Label>Description</Label>
              <Textarea value={catalogDescription} onChange={(e) => setCatalogDescription(e.target.value)} />
              <Label>WhatsApp Number</Label>
              <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value.replace(/\s+/g, "_"))} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Add Product</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Product Name" value={currentProduct.name} onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })} />
              <Textarea placeholder="Description" value={currentProduct.description} onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })} />
              <Input placeholder="Price" value={currentProduct.price} onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })} />
              <Input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} />
              {currentProduct.image && (
                <img src={currentProduct.image} alt="Preview" className="w-full h-32 object-cover rounded-md border" />
              )}
              <Button onClick={addProduct} disabled={uploading} className="w-full gap-2">
                {uploading ? "Uploading..." : <><Plus size={20} /> Add Product</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Eye size={20} /> Preview</CardTitle></CardHeader>
            <CardContent>
              <h2 className="text-2xl font-bold text-center mb-2">{catalogName || "Your Catalog Name"}</h2>
              <p className="text-slate-600 text-center mb-6">{catalogDescription || "Your catalog description"}</p>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg p-4 border relative">
                    <Button variant="ghost" size="sm" className="absolute top-2 right-2 text-red-600" onClick={() => removeProduct(product.id)}>
                      <X size={16} />
                    </Button>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden">
                        <img src={product.image || "https://via.placeholder.com/200"} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-slate-600">{product.description}</p>
                        <p className="text-lg font-bold text-green-600">{product.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={saveCatalog} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 gap-2">
              <Save size={20} /> Save Catalog
            </Button>
            <Button variant="outline" className="gap-2">
              <Eye size={20} /> Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCatalog;
