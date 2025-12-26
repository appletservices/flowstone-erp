import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Package, Loader2 } from "lucide-react";
import { z } from "zod";

/* ---------------- Validation ---------------- */
const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(4, "Password must be at least 6 characters");

/* ---------------- API URL ---------------- */
const API_URL = import.meta.env.VITE_API_URL; 
// example: http://localhost:8000/api

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  /* ---------------- Check Existing Session ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      navigate("/", { replace: true });
    }

    setCheckingSession(false);
  }, [navigate]);

  /* ---------------- Validation ---------------- */
  const validateInputs = () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast({
        title: "Invalid Email",
        description: emailResult.error.errors[0].message,
        variant: "destructive",
      });
      return false;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast({
        title: "Invalid Password",
        description: passwordResult.error.errors[0].message,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  /* ---------------- Login ---------------- */
 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateInputs()) return;

  setLoading(true);

  try {
    const response = await fetch(`${API_URL}/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (!data.token) {
      throw new Error("Invalid server response");
    }

    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });

    navigate("/", { replace: true });

  } catch (error: any) {
    toast({
      title: "Login Failed",
      description: error.message || "Invalid email or password",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


  /* ---------------- Loader ---------------- */
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
            <Package className="h-7 w-7 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">InventoryPro</CardTitle>
            <CardDescription className="mt-1">
              Enterprise Inventory & Accounting Management
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
