import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Eye, Server, Code, Heart } from "lucide-react";

const AboutPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "End-to-End Encryption",
      description: "All messages are encrypted using industry-standard protocols. Only you and your recipient can read your messages.",
    },
    {
      icon: Lock,
      title: "Zero Knowledge",
      description: "We can't read your messages even if we wanted to. Your data is encrypted before it leaves your device.",
    },
    {
      icon: Eye,
      title: "No Data Collection",
      description: "We don't track your activity or sell your data. Your privacy is paramount.",
    },
    {
      icon: Server,
      title: "Decentralized Architecture",
      description: "Messages are distributed across secure nodes, ensuring no single point of failure.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/chat")}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">About SecureChat</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent mb-6 shadow-glow">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Privacy First Messaging
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            SecureChat is built on the principle that your conversations should be private, 
            secure, and completely under your control.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Technical Details */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-12 animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <Code className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold">Technical Implementation</h3>
          </div>
          
          <div className="space-y-4 text-muted-foreground">
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-foreground mb-1">256-bit AES Encryption</p>
                <p className="text-sm">Military-grade encryption for all message content and metadata.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-foreground mb-1">Perfect Forward Secrecy</p>
                <p className="text-sm">Each message uses unique encryption keys that are automatically destroyed after use.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-foreground mb-1">Open Source</p>
                <p className="text-sm">Our code is publicly auditable to ensure security and transparency.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 text-muted-foreground mb-6">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>for privacy</span>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            Version 1.0.0 • © 2024 SecureChat
          </p>
          <Button
            onClick={() => navigate("/chat")}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
          >
            Back to Chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
