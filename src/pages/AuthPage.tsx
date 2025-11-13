import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Call backend login/register
    (async () => {
      try {
        const endpoint = isLogin ? "/api/login" : "/api/register";
        const body: any = isLogin
          ? { usernameOrEmail: email, password }
          : { username: username || email.split("@")[0], email, password };

        console.log('Attempting auth request to:', API_URL + endpoint);
        const resp = await fetch(API_URL + endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await resp.json();
        if (!resp.ok) {
          toast({ title: "Error", description: data.error || "Auth failed", variant: "destructive" });
          return;
        }

        // store account in accounts list (multi-account support)
        try {
          const raw = localStorage.getItem("accounts") || "[]";
          const accounts = JSON.parse(raw);
          const existing = accounts.findIndex((a: any) => a.user?.id === data.user?.id);
          if (existing > -1) {
            accounts[existing] = { user: data.user, token: data.token };
          } else {
            accounts.unshift({ user: data.user, token: data.token });
          }
          localStorage.setItem("accounts", JSON.stringify(accounts));
        } catch (err) {
          // fallback single account
          localStorage.setItem("accounts", JSON.stringify([{ user: data.user, token: data.token }]));
        }

        // set active account token/user
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast({ title: isLogin ? "Welcome back!" : "Account created!", description: isLogin ? "You've successfully logged in" : "Welcome to SecureChat" });
        navigate("/chat");
      } catch (err) {
        toast({ title: "Error", description: "Network error", variant: "destructive" });
      }
    })();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-pulse-glow"></div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-[0_0_40px_hsl(189_94%_43%/0.3)]">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SecureChat
          </h1>
          <p className="text-muted-foreground mt-2">End-to-end encrypted messaging</p>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card backdrop-blur-sm">
          {/* Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md transition-all ${
                isLogin
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md transition-all ${
                !isLogin
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder="your-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-3 bg-input border-border focus:border-primary"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">{isLogin ? "Username or Email" : "Email"}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type={isLogin ? "text" : "email"}
                  placeholder={isLogin ? "username or you@example.com" : "you@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-input border-border focus:border-primary"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-input border-border focus:border-primary"
                    required
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                  onClick={() => toast({ title: "Password reset link sent to your email" })}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-glow"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>256-bit encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;