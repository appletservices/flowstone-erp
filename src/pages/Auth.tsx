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
import { Package, Loader2, User } from "lucide-react";
import { z } from "zod";

/* ---------------- Demo Account ---------------- */
const DEMO_ACCOUNT = {
  email: "demo@invenflow.com",
  password: "demo123",
  user: {
    id: "demo-user-001",
    email: "demo@invenflow.com",
    name: "Demo User",
    role: "Administrator",
  },
};

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
  const location = useLocation();

  /* ---------------- Existing Session ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) navigate("/", { replace: true });
    setCheckingSession(false);
  }, [navigate]);

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
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailSchema.safeParse(email).success) {
      toast.error("Invalid email");
      return;
    }

    if (!passwordSchema.safeParse(password).success) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    // Demo credentials
    if (email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
      handleDemoLogin();
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

      navigate("/", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Authentication Failed");
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
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <User className="h-4 w-4" />
            Continue with Demo
          </Button>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
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

          <p className="text-center text-xs text-muted-foreground">
            Demo: demo@invenflow.com / demo123
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
