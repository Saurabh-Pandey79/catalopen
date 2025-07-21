import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Share2, Edit3, Trash2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import UPIRechargeModal from "@/components/UPIRechargeModal";

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
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [catalogToDelete, setCatalogToDelete] = useState<Catalog | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({ title: "Not authenticated", description: "Please log in again.", variant: "destructive" });
        return;
      }

      // Fetch wallet
      const { data: wallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!wallet || wallet.balance <= 0) {
        setWalletBalance(0);
      } else {
        setWalletBalance(wallet.balance);
      }

      const rechargeDate = new Date(wallet?.updated_at || wallet?.created_at);
      const today = new Date();
      const daysSinceRecharge = Math.floor((today.getTime() - rechargeDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceRecharge >= 25 && daysSinceRecharge < 30) {
        setWalletWarning(true);
      }

      if (daysSinceRecharge >= 30 && wallet && wallet.balance > 0) {
        await supabase.from("wallets").update({ balance: 0 }).eq("user_id", user.id);
        await supabase.from("catalogs").update({ is_live: false }).eq("user_id", user.id);
        setWalletBalance(0);
        toast({ title: "Account Expired", description: "Your wallet expired after 30 days. Renew to reactivate.", variant: "destructive" });
      }

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

  const handleDeleteConfirm = async () => {
    if (!catalogToDelete) return;

    const { error } = await supabase.from("catalogs").delete().eq("id", catalogToDelete.id);
    if (error) {
      toast({ title: "Failed to delete catalog", description: error.message, variant: "destructive" });
    } else {
      setCatalogs((prev) => prev.filter((c) => c.id !== catalogToDelete.id));
      toast({ title: "Catalog deleted" });
    }
    setCatalogToDelete(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Wallet Recharge Warning */}
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

      {/* Recharge Modal */}
      <UPIRechargeModal
        open={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        upiId="saurabhv.pandey5@oksbi"
        amount={199}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!catalogToDelete} onOpenChange={() => setCatalogToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-700">
            Are you sure you want to delete the catalog{" "}
            <span className="font-semibold">{catalogToDelete?.name}</span>? This action cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setCatalogToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                        if (walletBalance === 0) {
                          setShowRechargeModal(true);
                          return;
                        }

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
                      onClick={() => setCatalogToDelete(catalog)}
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
