import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { toast } from "sonner";
<<<<<<< HEAD
import { Package, Loader2 } from "lucide-react";
=======
import { Package, Loader2, User } from "lucide-react";
>>>>>>> c326f3c136df0f0f7c231326c558a1d778e6cbb2
import { z } from "zod";

/* ---------------- Validation ---------------- */
const emailSchema = z.string().email();
const passwordSchema = z.string().min(4);

const API_URL = import.meta.env.VITE_API_URL;

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const navigate = useNavigate();
<<<<<<< HEAD
=======
  const location = useLocation();
>>>>>>> c326f3c136df0f0f7c231326c558a1d778e6cbb2

  /* ---------------- Existing Session ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      navigate("/", { replace: true });
    }
    setCheckingSession(false);
  }, [navigate]);

<<<<<<< HEAD
  /* ---------------- Login ---------------- */
=======
  /* ---------------- Demo Login ---------------- */
  const handleDemoLogin = () => {
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem("auth_token", "demo-token");
      localStorage.setItem("auth_user", JSON.stringify(DEMO_ACCOUNT.user));

      toast.success("Demo Login Successful");
      navigate("/", { replace: true });
      setLoading(false);
    }, 500);
  };

  /* ---------------- Real Login ---------------- */
>>>>>>> c326f3c136df0f0f7c231326c558a1d778e6cbb2
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailSchema.safeParse(email).success) {
<<<<<<< HEAD
      toast.error("Invalid email address");
=======
      toast.error("Invalid email");
>>>>>>> c326f3c136df0f0f7c231326c558a1d778e6cbb2
      return;
    }

    if (!passwordSchema.safeParse(password).success) {
      toast.error("Password must be at least 4 characters");
<<<<<<< HEAD
=======
      return;
    }

    // Demo credentials
    if (email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
      handleDemoLogin();
>>>>>>> c326f3c136df0f0f7c231326c558a1d778e6cbb2
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      /* ---------------- Save Auth ---------------- */
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));

      toast.success(`Welcome ${data.user.name}`);

      // ✅ Always go to root
      navigate("/", { replace: true });
    } catch (error: any) {
<<<<<<< HEAD
      toast.error(error.message || "Authentication failed");
=======
      toast.error(error.message || "Authentication Failed");
>>>>>>> c326f3c136df0f0f7c231326c558a1d778e6cbb2
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Loader ---------------- */
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
            <Package className="h-7 w-7 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">InvenFlow</CardTitle>
            <CardDescription>
              Precision Inventory & Accounting
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button className="w-full" disabled={loading}>
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
