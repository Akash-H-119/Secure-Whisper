import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, User, Bell, Shield, Key, Moon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

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
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Section */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Profile</h2>
          </div>

          <div className="flex items-center gap-6 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl">
                JD
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" className="border-border hover:bg-muted">
              Change Avatar
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-input border-border mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border mt-2"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive notifications for new messages</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Read Receipts</p>
                <p className="text-sm text-muted-foreground">Let others know when you've read their messages</p>
              </div>
              <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>
            <div className="pt-4 border-t border-border">
              <Button variant="outline" className="w-full border-border hover:bg-muted">
                <Key className="w-4 h-4 mr-2" />
                View Security Keys
              </Button>
            </div>
            <div>
              <Button variant="outline" className="w-full border-border hover:bg-muted">
                Change Password
              </Button>
            </div>
            <div>
              <Button 
                variant="outline" 
                className="w-full border-border hover:bg-muted text-destructive hover:text-destructive"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  localStorage.removeItem("accounts");
                  navigate("/");
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/chat")}
            className="flex-1 border-border hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
