import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigate to role selection on successful login
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#6B8DD6] via-[#8FA8E0] to-[#B4C7EA] p-8">
      {/* Floating decorative elements */}
      <div className="absolute top-[10%] left-[10%] w-12 h-6 bg-white/20 rounded-full blur-sm animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-[25%] right-[15%] w-8 h-4 bg-white/15 rounded-full blur-sm animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[60%] left-[8%] w-16 h-8 bg-white/20 rounded-full blur-sm animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[20%] right-[12%] w-10 h-5 bg-white/15 rounded-full blur-sm animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-[40%] right-[35%] w-14 h-7 bg-white/20 rounded-full blur-sm animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-[70%] left-[20%] w-9 h-5 bg-white/15 rounded-full blur-sm animate-float" style={{ animationDelay: '2.5s' }} />
      
      <div className="max-w-6xl w-full flex items-center justify-center gap-20">
        {/* Left side - Kairo & Career Simulator Info */}
        <div className="flex-1 max-w-md space-y-8">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <img src="/logo.png" alt="Kairo Logo" className="w-12 h-12 object-contain rounded-lg" />
            </div>
            
            <div>
              <h1 className="text-white text-xl font-bold">Kairo</h1>
              <h1 className="text-white text-lg">Career Simulator</h1>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-white">
            Navigate your career path, make strategic decisions, and climb the corporate ladder in this immersive job simulation experience.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2 p-5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
              <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-white">500+</div>
                <div className="text-sm text-white">Career Paths</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 p-5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
              <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-white">50K+</div>
                <div className="text-sm text-white">Active Users</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Login Form */}
        <div className="flex-1 max-w-md">
          <div className="w-full">
            {/* Glass card container */}
            <div className="p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-[#2d3748] text-2xl mb-2">Welcome To Kairo</h2>
                {/* <p className="text-[#2d3748] text-sm">
                  Sign in to continue with your own Career Simulator.
                </p> */}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#2d3748]">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white border-gray-200 text-[#2d3748] placeholder:text-gray-400 h-11"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                {/* Password field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#2d3748]">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white border-gray-200 text-[#2d3748] placeholder:text-gray-400 h-11 pr-10"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <a href="#" className="text-sm text-[#5B7FCC] hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                </div>
                
                {/* Sign in button */}
                <Button 
                  type="submit" 
                  className="w-full bg-[#3e67a8] hover:bg-[#355892] text-white border-0 h-11 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
              
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/90 px-3 text-gray-500">
                    Or Continue With
                  </span>
                </div>
              </div>
              
              {/* Social login buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </button>
                
                <button
                  type="button"
                  className="flex items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <svg className="size-5" fill="#24292e" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </button>
                
                <button
                  type="button"
                  className="flex items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <svg className="size-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              </div>
              
              {/* Sign up link */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account yet?{" "}
                <a href="#" className="text-[#5B7FCC] hover:underline">
                  Register for free
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

