
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Eye, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product>({
    id: "",
    name: "",
    description: "",
    price: "",
    image: ""
  });

  const addProduct = () => {
    if (!currentProduct.name || !currentProduct.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in product name and price",
        variant: "destructive"
      });
      return;
    }

    const newProduct = {
      ...currentProduct,
      id: Date.now().toString()
    };
    setProducts([...products, newProduct]);
    setCurrentProduct({ id: "", name: "", description: "", price: "", image: "" });
    toast({
      title: "Product Added",
      description: "Product has been added to your catalog"
    });
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const saveCatalog = () => {
    if (!catalogName || !whatsappNumber || products.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in catalog name, WhatsApp number, and add at least one product",
        variant: "destructive"
      });
      return;
    }

    const catalog = {
      id: Date.now().toString(),
      name: catalogName,
      description: catalogDescription,
      whatsappNumber,
      products,
      createdAt: new Date().toISOString()
    };

    const existingCatalogs = JSON.parse(localStorage.getItem('catalogs') || '[]');
    localStorage.setItem('catalogs', JSON.stringify([...existingCatalogs, catalog]));

    toast({
      title: "Catalog Created",
      description: "Your catalog has been saved successfully"
    });

    navigate('/dashboard');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Create New Catalog</h1>
        <p className="text-slate-600">Build your product catalog step by step</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Catalog Info */}
          <Card>
            <CardHeader>
              <CardTitle>Catalog Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="catalogName">Catalog Name</Label>
                <Input
                  id="catalogName"
                  value={catalogName}
                  onChange={(e) => setCatalogName(e.target.value)}
                  placeholder="My Awesome Store"
                />
              </div>
              <div>
                <Label htmlFor="catalogDescription">Description</Label>
                <Textarea
                  id="catalogDescription"
                  value={catalogDescription}
                  onChange={(e) => setCatalogDescription(e.target.value)}
                  placeholder="Describe your store..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Product */}
          <Card>
            <CardHeader>
              <CardTitle>Add Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label htmlFor="productDescription">Description</Label>
                <Textarea
                  id="productDescription"
                  value={currentProduct.description}
                  onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="productPrice">Price</Label>
                <Input
                  id="productPrice"
                  value={currentProduct.price}
                  onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})}
                  placeholder="$99.99"
                />
              </div>
              <div>
                <Label htmlFor="productImage">Image URL</Label>
                <Input
                  id="productImage"
                  value={currentProduct.image}
                  onChange={(e) => setCurrentProduct({...currentProduct, image: e.target.value})}
                  placeholder="https://example.com/image.jpg or use placeholder"
                />
              </div>
              <Button onClick={addProduct} className="w-full gap-2">
                <Plus size={20} />
                Add Product
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={20} />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-6 min-h-[400px]">
                <h2 className="text-2xl font-bold text-center mb-2">
                  {catalogName || "Your Catalog Name"}
                </h2>
                <p className="text-slate-600 text-center mb-6">
                  {catalogDescription || "Your catalog description"}
                </p>
                
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg p-4 border relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                        onClick={() => removeProduct(product.id)}
                      >
                        <X size={16} />
                      </Button>
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop";
                              }}
                            />
                          ) : (
                            <img 
                              src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop"
                              alt="placeholder"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-slate-600 mb-2">{product.description}</p>
                          <p className="text-lg font-bold text-green-600">{product.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {products.length === 0 && (
                    <div className="text-center text-slate-500 py-8">
                      No products added yet
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={saveCatalog} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2">
              <Save size={20} />
              Save Catalog
            </Button>
            <Button variant="outline" className="gap-2">
              <Eye size={20} />
              Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCatalog;
