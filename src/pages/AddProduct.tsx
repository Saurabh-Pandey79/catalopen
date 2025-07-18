import { useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "../supabaseClient";

const AddProduct = () => {
  const { id: catalogId } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleAddProduct = async () => {
    if (!name || !price) return alert("Name and price are required");

    const { error } = await supabase.from("products").insert([
      {
        catalog_id: catalogId,
        name,
        description,
        price: parseFloat(price),
        image_url: imageUrl
      }
    ]);

    if (error) alert("Error adding product: " + error.message);
    else alert("Product added successfully");
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Add Product</h2>
      <Input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
      <Input placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <Button onClick={handleAddProduct}>Add Product</Button>
    </div>
  );
};

export default AddProduct;
