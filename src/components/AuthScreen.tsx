
import { useNavigate } from "react-router-dom";
import { AuthForm } from "./auth/AuthForm";

const AuthScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image with blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm brightness-50"
        style={{ 
          backgroundImage: "url('/lovable-uploads/3b657a51-de27-4356-934a-555bdb22b16e.png')",
          transform: "scale(1.1)" 
        }}
      />

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white">Welcome Back</h1>
            <p className="text-gray-300">
              Sign in to continue
            </p>
          </div>

          {/* Glass morphism card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-xl">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
