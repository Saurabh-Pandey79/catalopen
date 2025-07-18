import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    business: "",
    country: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, phone, business, country, email, password } = formData;

    if (phone && !/^\+?[0-9]{7,15}$/.test(phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Enter a valid phone number with country code.",
        variant: "destructive",
      });
      return;
    }

    // Check if email already exists in auth
    const { data: existing, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      toast({
        title: "Account Already Exists",
        description: "Use login or forgot password.",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // ✅ Store formData locally to use after email verification
    localStorage.setItem("pending_profile", JSON.stringify(formData));

    toast({
      title: "Confirmation Email Sent",
      description: "Please check your inbox to confirm your email.",
    });

    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" placeholder="Full Name" onChange={handleChange} required />
          <Input name="phone" placeholder="Phone Number (optional)" onChange={handleChange} />
          <Input name="business" placeholder="Business Name" onChange={handleChange} required />
          <Input name="country" placeholder="Country" onChange={handleChange} required />
          <Input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <Input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
            Register
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
