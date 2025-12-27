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
const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(4, "Password must be at least 4 characters");

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

  /* ---------------- Demo Login ---------------- */
  const handleDemoLogin = () => {
    setLoading(true);
    
    setTimeout(() => {
      localStorage.setItem("auth_token", "demo-token-" + Date.now());
      localStorage.setItem("auth_user", JSON.stringify(DEMO_ACCOUNT.user));

      toast({
        title: "Welcome!",
        description: "Logged in with demo account",
      });

      navigate("/", { replace: true });
      setLoading(false);
    }, 500);
  };

  /* ---------------- Login ---------------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);

    // Check if demo credentials
    if (email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
      handleDemoLogin();
      return;
    }

    // Simulate auth delay for custom credentials
    setTimeout(() => {
      localStorage.setItem("auth_token", "user-token-" + Date.now());
      localStorage.setItem("auth_user", JSON.stringify({ 
        id: "user-" + Date.now(), 
        email: email,
        name: email.split("@")[0],
        role: "User"
      }));

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      navigate("/", { replace: true });
      setLoading(false);
    }, 500);
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
            <CardTitle className="text-2xl font-bold">InvenFlow</CardTitle>
            <CardDescription className="mt-1">
              Enterprise Inventory & Accounting Management
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Demo Login Button */}
          <Button 
            type="button" 
            variant="outline" 
            className="w-full gap-2 border-primary/30 hover:bg-primary/5"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <User className="h-4 w-4" />
            Continue with Demo Account
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or sign in with email
              </span>
            </div>
          </div>

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

          <p className="text-center text-xs text-muted-foreground">
            Demo: demo@invenflow.com / demo123
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
