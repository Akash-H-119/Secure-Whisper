import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Zap, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,94,89,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center animate-fade-in">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent mb-8 shadow-glow">
          <Shield className="w-12 h-12 text-primary-foreground" />
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          SecureChat
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Private conversations that stay private. 
          End-to-end encrypted messaging you can trust.
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors">
            <Shield className="w-8 h-8 text-primary mb-3 mx-auto" />
            <h3 className="font-semibold mb-2">End-to-End Encrypted</h3>
            <p className="text-sm text-muted-foreground">Your messages are encrypted before they leave your device</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors">
            <Lock className="w-8 h-8 text-primary mb-3 mx-auto" />
            <h3 className="font-semibold mb-2">Zero Knowledge</h3>
            <p className="text-sm text-muted-foreground">We can't read your messages even if we wanted to</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors">
            <Zap className="w-8 h-8 text-primary mb-3 mx-auto" />
            <h3 className="font-semibold mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">Secure doesn't mean slow. Chat in real-time</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-glow text-lg px-8"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button
            onClick={() => navigate("/about")}
            size="lg"
            variant="outline"
            className="border-border hover:bg-muted text-lg px-8"
          >
            Learn More
          </Button>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 text-primary" />
          <span>Trusted by privacy-conscious users worldwide</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
