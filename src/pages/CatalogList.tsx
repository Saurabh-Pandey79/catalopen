import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CatalogList = () => {
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCatalogs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("catalogs")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching catalogs:", error);
      } else {
        setCatalogs(data);
      }
    };

    fetchCatalogs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Your Catalogs</h1>
      {catalogs.map((catalog) => (
        <Card key={catalog.id}>
          <CardHeader>
            <CardTitle>{catalog.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-2">{catalog.description}</p>
            <div className="flex gap-4">
              <Button onClick={() => navigate(`/catalog/${catalog.id}`)}>View</Button>
              <Button variant="outline" onClick={() => navigate(`/edit/${catalog.id}`)}>Edit</Button>
              <Button variant="destructive">Delete</Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {catalogs.length === 0 && (
        <p className="text-slate-500 text-center">No catalogs found.</p>
      )}
    </div>
  );
};

export default CatalogList;
