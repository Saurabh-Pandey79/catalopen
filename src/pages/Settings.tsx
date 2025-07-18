import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    business: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        setUserId(user.id);

        const { data: profileData } = await supabase
          .from("profiles")
          .select("name, phone, business")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleProfileUpdate = async () => {
    if (!confirmPassword) {
      toast({
        title: "Password Required",
        description: "Please enter your password to confirm changes.",
        variant: "destructive",
      });
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: confirmPassword,
    });

    if (authError) {
      toast({
        title: "Authentication Failed",
        description: "Incorrect password",
        variant: "destructive",
      });
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", userId);

    if (updateError) {
      toast({
        title: "Update Failed",
        description: updateError.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Profile Updated" });
      setConfirmPassword("");
    }
  };

  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Fill all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      toast({
        title: "Incorrect Password",
        description: "Old password is incorrect",
        variant: "destructive",
      });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      toast({
        title: "Password Change Failed",
        description: updateError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Updated",
        description: "Your password has been changed.",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged Out",
        description: "You have been logged out.",
      });
      navigate("/login");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
        <p className="text-slate-600">Manage your profile and security</p>
        {email && (
          <p className="text-sm text-slate-500 mt-1">
            Logged in as: <strong>{email}</strong>
          </p>
        )}
      </div>

      <div className="grid gap-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} /> Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={profile.name}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={profile.phone}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Business Name</Label>
              <Input
                value={profile.business}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, business: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Confirm Password to Save</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleProfileUpdate}>Update Profile</Button>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔐 Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({
                    ...p,
                    currentPassword: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({
                    ...p,
                    newPassword: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((p) => ({
                    ...p,
                    confirmPassword: e.target.value,
                  }))
                }
              />
            </div>
            <Button variant="outline" onClick={handlePasswordChange}>
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard size={20} /> Billing & Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Free Plan</h3>
              <p className="text-green-700 text-sm">
                You're currently on the free plan.
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <LogOut size={20} /> Logout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
