
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Share2, Edit3, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface Catalog {
  id: string;
  name: string;
  description: string;
  whatsappNumber: string;
  products: any[];
  createdAt: string;
}

const Dashboard = () => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);

  useEffect(() => {
    const savedCatalogs = localStorage.getItem('catalogs');
    if (savedCatalogs) {
      setCatalogs(JSON.parse(savedCatalogs));
    }
  }, []);

  const deleteCatalog = (id: string) => {
    const updatedCatalogs = catalogs.filter(catalog => catalog.id !== id);
    setCatalogs(updatedCatalogs);
    localStorage.setItem('catalogs', JSON.stringify(updatedCatalogs));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
          <p className="text-slate-600">Manage your product catalogs</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Link to="/create" className="gap-2">
            <Plus size={20} />
            Create New Catalog
          </Link>
        </Button>
      </div>

      {catalogs.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">No catalogs yet</h3>
            <p className="text-slate-600 mb-6">Create your first product catalog to get started</p>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Link to="/create" className="gap-2">
                <Plus size={20} />
                Create Your First Catalog
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.map((catalog) => (
            <Card key={catalog.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">{catalog.name}</CardTitle>
                <p className="text-slate-600 text-sm">{catalog.description}</p>
                <p className="text-xs text-slate-500">
                  Created: {new Date(catalog.createdAt).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-600">
                    {catalog.products.length} products
                  </span>
                  <span className="text-sm text-slate-600">
                    WhatsApp: {catalog.whatsappNumber}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to={`/catalog/${catalog.id}`} className="gap-1">
                      <Eye size={16} />
                      Preview
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share2 size={16} />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Edit3 size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 text-red-600 hover:text-red-700"
                    onClick={() => deleteCatalog(catalog.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
