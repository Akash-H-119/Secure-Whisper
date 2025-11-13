import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Users, ArrowRight, Check } from "lucide-react";

const steps = [
  {
    icon: Shield,
    title: "End-to-End Encryption",
    description: "Your messages are encrypted on your device and can only be read by you and your recipient.",
  },
  {
    icon: Lock,
    title: "Private by Default",
    description: "We don't store your messages on our servers. Your privacy is our top priority.",
  },
  {
    icon: Users,
    title: "Secure Contacts",
    description: "Add trusted contacts and start secure conversations instantly.",
  },
];

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/chat");
    }
  };

  const handleSkip = () => {
    navigate("/chat");
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-8 bg-primary"
                  : index < currentStep
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 mb-8 border border-primary/30">
            <CurrentIcon className="w-12 h-12 text-primary" />
          </div>

          <h2 className="text-3xl font-bold mb-4">{steps[currentStep].title}</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-md mx-auto">
            {steps[currentStep].description}
          </p>

          {/* Features list for current step */}
          <div className="space-y-3 mb-12">
            {currentStep === 0 && (
              <>
                <div className="flex items-center gap-3 text-left bg-card/50 p-4 rounded-lg border border-border">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Messages encrypted before leaving your device</span>
                </div>
                <div className="flex items-center gap-3 text-left bg-card/50 p-4 rounded-lg border border-border">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Only you and recipient can read messages</span>
                </div>
              </>
            )}
            {currentStep === 1 && (
              <>
                <div className="flex items-center gap-3 text-left bg-card/50 p-4 rounded-lg border border-border">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Zero knowledge architecture</span>
                </div>
                <div className="flex items-center gap-3 text-left bg-card/50 p-4 rounded-lg border border-border">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">No message backups on our servers</span>
                </div>
              </>
            )}
            {currentStep === 2 && (
              <>
                <div className="flex items-center gap-3 text-left bg-card/50 p-4 rounded-lg border border-border">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Verify contact security keys</span>
                </div>
                <div className="flex items-center gap-3 text-left bg-card/50 p-4 rounded-lg border border-border">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Start chatting in seconds</span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1 border-border hover:bg-muted"
            >
              Skip
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-glow"
            >
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
