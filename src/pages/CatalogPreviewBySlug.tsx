import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowLeft } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface Catalog {
  id: string;
  name: string;
  description: string;
  whatsapp: string;
  products: Product[];
}

const CatalogPreviewBySlug = () => {
  const { slug } = useParams();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("catalogs")
        .select("id, name, description, whatsapp, products(id, name, description, price, image_url)")
        .eq("slug", slug)
        .eq("is_live", true)
        .single();

      if (error) {
        console.error("Error fetching catalog by slug:", error.message);
        setCatalog(null);
      } else {
        setCatalog(data as Catalog);
      }

      setLoading(false);
    };

    fetchCatalog();
  }, [slug]);

  const orderOnWhatsApp = (product: Product) => {
    if (!catalog?.whatsapp) return;
    const message = `Hi! I'm interested in ordering: ${product.name} - ₹${product.price}`;
    const whatsappUrl = `https://wa.me/${catalog.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-600">Loading catalog...</div>;
  }

  if (!catalog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Catalog not found or unavailable</h2>
            <Button asChild>
              <Link to="/" className="gap-2">
                <ArrowLeft size={16} />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            {catalog.name}
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">{catalog.description}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {catalog.products.length === 0 ? (
          <div className="text-center text-slate-500 mt-16">
            No products available in this catalog.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalog.products.map((product) => (
              <Card
                key={product.id}
                className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-full h-64 bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      product.image_url?.startsWith("blob:")
                        ? "https://placehold.co/400x400?text=No+Image"
                        : product.image_url || "https://placehold.co/400x400?text=No+Image"
                    }
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold text-slate-800">{product.name}</h3>
                  <p className="text-sm text-slate-600">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-bold text-lg">₹{product.price}</span>
                    <Button
                      size="sm"
                      onClick={() => orderOnWhatsApp(product)}
                      className="bg-green-600 hover:bg-green-700 gap-1"
                    >
                      <MessageCircle size={16} />
                      Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-6 py-6 text-center text-slate-500">
          Powered by <span className="font-bold text-slate-800">Catal</span>
        </div>
      </footer>
    </div>
  );
};

export default CatalogPreviewBySlug;
