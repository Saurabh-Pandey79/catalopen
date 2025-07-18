import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Share2, Edit3, Trash2, Copy, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Catalog {
  id: string;
  name: string;
  description: string;
  whatsapp: string;
  created_at: string;
  slug: string;
  is_live: boolean;
  products: { id: string }[];
}

const Dashboard = () => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletWarning, setWalletWarning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({ title: "Not authenticated", description: "Please log in again.", variant: "destructive" });
        return;
      }

      // Fetch wallet
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

        if (!wallet || wallet.balance <= 0) {
          toast({
            title: "Wallet not recharged",
            description: "Please recharge your wallet to continue.",
            variant: "destructive",
          });
        }

      const rechargeDate = new Date(wallet.updated_at || wallet.created_at);
      const today = new Date();
      const daysSinceRecharge = Math.floor((today.getTime() - rechargeDate.getTime()) / (1000 * 60 * 60 * 24));

      // Show warning if within 5 days of expiry
      if (daysSinceRecharge >= 25 && daysSinceRecharge < 30) {
        setWalletWarning(true);
      }

      // If expired, disable all catalogs and reset wallet
      if (daysSinceRecharge >= 30 && wallet.balance > 0) {
        await supabase
          .from("wallets")
          .update({ balance: 0 })
          .eq("user_id", user.id);

        await supabase
          .from("catalogs")
          .update({ is_live: false })
          .eq("user_id", user.id);

        toast({ title: "Account Expired", description: "Your wallet expired after 30 days. Renew to reactivate.", variant: "destructive" });
      }

      // Fetch catalogs
      const { data: catalogsData, error } = await supabase
        .from("catalogs")
        .select("id, name, description, whatsapp, created_at, slug, is_live, products(id)")
        .eq("user_id", user.id);

      if (error) {
        toast({ title: "Failed to load catalogs", description: error.message, variant: "destructive" });
      } else {
        setCatalogs(catalogsData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const deleteCatalog = async (id: string) => {
    const { error } = await supabase.from("catalogs").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete catalog", description: error.message, variant: "destructive" });
      return;
    }

    setCatalogs((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Catalog deleted" });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {walletWarning && (
        <Dialog open={walletWarning} onOpenChange={setWalletWarning}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600">
                <AlertCircle size={20} /> Wallet Expiry Soon
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-700 mt-2">
              Your subscription will expire in less than 5 days. Recharge now to continue using sharing and saving features without interruption.
            </p>
          </DialogContent>
        </Dialog>
      )}

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

      {loading ? (
        <p className="text-center text-slate-500">Loading catalogs...</p>
      ) : catalogs.length === 0 ? (
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
          {catalogs.map((catalog) => {
            const url = `${window.location.origin}/${catalog.slug}`;

            return (
              <Card key={catalog.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800 flex justify-between">
                    {catalog.name}
                    {!catalog.is_live && (
                      <span className="text-xs text-red-500 font-medium ml-2">Not Live</span>
                    )}
                  </CardTitle>
                  <p className="text-slate-600 text-sm">{catalog.description}</p>
                  <p className="text-xs text-slate-500">Created: {new Date(catalog.created_at).toLocaleDateString()}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-slate-600">{catalog.products.length} products</span>
                    <span className="text-sm text-slate-600">WhatsApp: {catalog.whatsapp}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link to={`/catalog/${catalog.id}`} className="gap-1">
                        <Eye size={16} />
                        Preview
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={async () => {
                        if (navigator.share && window.isSecureContext) {
                          try {
                            await navigator.share({
                              title: catalog.name,
                              text: `Check out my product catalog "${catalog.name}"`,
                              url,
                            });
                            return;
                          } catch {
                            console.warn("Web Share failed");
                          }
                        }

                        try {
                          await navigator.clipboard.writeText(url);
                          toast({ title: "Copied", description: "Catalog link copied to clipboard." });
                        } catch {
                          prompt("Copy this link manually:", url);
                        }
                      }}
                    >
                      <Share2 size={16} />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                      <Link to={`/edit/${catalog.id}`}>
                        <Edit3 size={16} />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-red-600 hover:text-red-700"
                      onClick={() => deleteCatalog(catalog.id)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
