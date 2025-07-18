import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
}

interface Catalog {
  id: string;
  name: string;
  description: string;
  whatsapp: string;
  products: Product[];
}

const PreviewCatalog = () => {
  const { id } = useParams();
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      const { data, error } = await supabase
        .from("catalogs")
        .select("*, products(*)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching catalog:", error);
      } else {
        setCatalog({ ...data, products: data.products || [] });
      }
    };

    fetchCatalog();
  }, [id]);

  const orderOnWhatsApp = (product: Product) => {
    const message = `Hi! I'm interested in ordering: ${product.name} - ${product.price}`;
    const whatsappUrl = `https://wa.me/${catalog?.whatsapp?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!catalog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Catalog not found</h2>
            <Button asChild>
              <Link to="/dashboard" className="gap-2">
                <ArrowLeft size={16} />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            {catalog.name}
          </h1>
          {catalog.description && (
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {catalog.description}
            </p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {catalog.products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop"}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop";
                  }}
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{product.name}</h3>
                {product.description && (
                  <p className="text-slate-600 mb-4 text-sm leading-relaxed">{product.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">{product.price}</span>
                  <Button 
                    onClick={() => orderOnWhatsApp(product)}
                    className="bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <MessageCircle size={16} />
                    Order on WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {catalog.products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No products available in this catalog.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="container mx-auto px-6 py-8 text-center">
          <p className="text-slate-500 mb-4">Powered by</p>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Catal
          </div>
          <p className="text-sm text-slate-400 mt-2">Create your own catalog at catal.app</p>
        </div>
      </div>
    </div>
  );
};

export default PreviewCatalog;