import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "../supabaseClient";

const EditCatalog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image_url: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      const { data: catalogData, error: catalogError } = await supabase
        .from("catalogs")
        .select("*")
        .eq("id", id)
        .single();

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("catalog_id", id);

      if (catalogError || productsError) {
        toast({
          title: "Error loading data",
          description: catalogError?.message || productsError?.message,
          variant: "destructive"
        });
      } else {
        setCatalog(catalogData);
        setProducts(productsData || []);
      }

      setLoading(false);
    };

    fetchCatalog();
  }, [id]);

  const updateProduct = (index: number, field: string, value: string) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (!error) {
      setProducts(products.filter(p => p.id !== productId));
      toast({ title: "Product deleted" });
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveCatalog = async () => {
    const { error } = await supabase
      .from("catalogs")
      .update({
        name: catalog.name,
        description: catalog.description,
        is_live: catalog.is_live,
        whatsapp: catalog.whatsapp,
        slug: catalog.slug?.replace(/\s+/g, "_")
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({ title: "Catalog Updated!" });
      navigate("/dashboard");
    }
  };

  const handleSaveProducts = async () => {
    const updates = products.map((p) =>
      supabase.from("products").update({
        name: p.name,
        description: p.description,
        price: parseFloat(p.price),
        image_url: p.image_url
      }).eq("id", p.id)
    );

    await Promise.all(updates);
    toast({ title: "Products updated" });
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: "Missing product info",
        description: "Name and price are required",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await supabase.from("products").insert([{
      ...newProduct,
      catalog_id: id,
      price: parseFloat(newProduct.price)
    }]).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProducts([...products, data]);
      setNewProduct({ name: "", description: "", price: "", image_url: "" });
      toast({ title: "Product added" });
    }
  };

  // ✅ Async file handler moved here
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Upload Failed",
        description: uploadError.message,
        variant: "destructive"
      });
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    setNewProduct({ ...newProduct, image_url: publicUrlData.publicUrl });
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Loading...</div>;
  if (!catalog) return <div className="text-center py-12 text-red-600">Catalog not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 mt-10">
      <h2 className="text-3xl font-bold text-slate-800">Edit Catalog</h2>

      {/* Catalog Form */}
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-slate-700 font-medium">Catalog Name</label>
          <Input value={catalog.name} onChange={(e) => setCatalog({ ...catalog, name: e.target.value })} />
        </div>
        <div>
          <label className="block mb-1 text-slate-700 font-medium">Description</label>
          <Textarea value={catalog.description} onChange={(e) => setCatalog({ ...catalog, description: e.target.value })} />
        </div>
        <div>
          <label className="block mb-1 text-slate-700 font-medium">WhatsApp Number</label>
          <Input value={catalog.whatsapp} onChange={(e) => setCatalog({ ...catalog, whatsapp: e.target.value })} />
        </div>
        <div>
          <label className="block mb-1 text-slate-700 font-medium">Custom Catalog Slug</label>
          <Input value={catalog.slug || ""} onChange={(e) => setCatalog({ ...catalog, slug: e.target.value.replace(/\s+/g, "_") })} />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input type="checkbox" checked={catalog.is_live} onChange={(e) => setCatalog({ ...catalog, is_live: e.target.checked })} />
          <span className="text-sm text-slate-700">Catalog is live</span>
        </div>
        <Button onClick={handleSaveCatalog} className="w-full bg-gradient-to-r from-purple-600 to-blue-600">Save Catalog Info</Button>
      </div>

      {/* Product List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800">Products</h3>
        {products.map((p, i) => (
          <div key={p.id} className="p-4 border rounded-md space-y-2">
            <Input placeholder="Name" value={p.name} onChange={(e) => updateProduct(i, "name", e.target.value)} />
            <Textarea placeholder="Description" value={p.description} onChange={(e) => updateProduct(i, "description", e.target.value)} />
            <Input placeholder="Price" value={p.price} onChange={(e) => updateProduct(i, "price", e.target.value)} />
            <Input placeholder="Image URL" value={p.image_url} onChange={(e) => updateProduct(i, "image_url", e.target.value)} />
            <Button variant="destructive" onClick={() => deleteProduct(p.id)}>Delete</Button>
          </div>
        ))}
        <Button onClick={handleSaveProducts} className="w-full">Save All Product Changes</Button>
      </div>

      {/* Add New Product */}
      <div className="space-y-4 mt-8">
        <h3 className="text-xl font-bold text-slate-800">Add New Product</h3>
        <Input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
        <Textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
        <Input placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />

        <Input placeholder="Image URL (optional)" value={newProduct.image_url} onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} />

        <div>
          <label className="block mb-1 text-slate-700 font-medium">Upload Image</label>
          <input type="file" accept="image/*" onChange={handleFileUpload} />
        </div>

        {newProduct.image_url && (
          <img src={newProduct.image_url} alt="Preview" className="h-32 w-full object-cover rounded-md border" />
        )}

        <Button onClick={handleAddProduct} className="w-full bg-gradient-to-r from-green-500 to-lime-500">
          Add Product
        </Button>
      </div>
    </div>
  );
};

export default EditCatalog;
