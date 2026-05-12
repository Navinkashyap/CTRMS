import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import brandLogo from "../assets/logo.jpeg";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { login } from "../lib/authApi";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white selection:bg-indigo-500/30 font-sans">
      
      {/* Left Panel: Branding & Marketing (Hidden on Mobile) */}
      <div className="hidden lg:flex relative w-[55%] bg-[#0a0a0c] overflow-hidden flex-col justify-between p-12">
        {/* Dynamic Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
        </div>

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl p-1 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <img src={brandLogo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div>
             <h2 className="text-xl font-black text-white tracking-tight italic">PERFECTRANS</h2>
             <p className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase">Enterprise</p>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg mt-auto mb-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold mb-6 backdrop-blur-md">
            <Sparkles size={14} />
            <span>New Enterprise Workspace 2.0</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Streamline your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">translation workflows</span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 font-medium leading-relaxed max-w-md">
            Manage projects, vendors, clients, and invoicing all in one powerful, unified dashboard built for modern agencies.
          </p>

          {/* Feature List */}
          <div className="space-y-4">
            {[
              "End-to-end Project Management",
              "Advanced Vendor Evaluation & Tracking",
              "Automated Invoicing & Financials"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 animate-in slide-in-from-left-4 fade-in duration-700" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <CheckCircle2 size={14} className="text-indigo-400" />
                </div>
                <span className="text-slate-300 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-widest">
           <span>© 2026 Perfectrans</span>
           <div className="flex gap-6">
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Terms</a>
           </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center relative p-6 sm:p-12 lg:p-24 bg-[#f8fafc]">
        {/* Mobile Logo (Only visible on small screens) */}
        <div className="lg:hidden flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl p-1.5 shadow-xl shadow-slate-200 border border-slate-100 mb-4">
            <img src={brandLogo} alt="Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">PERFECTRANS</h2>
        </div>

        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome back</h2>
            <p className="text-slate-500 font-medium text-sm">Please enter your details to access your account.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all shadow-sm"
                  placeholder="admin@perfectrans.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[11px] font-black text-indigo-600 hover:text-indigo-700 transition-colors">FORGOT PASSWORD?</button>
              </div>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-14 pl-12 pr-12 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1 py-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
              <label htmlFor="remember" className="text-sm font-semibold text-slate-600 cursor-pointer select-none">Remember for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-6 group/btn"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center lg:text-left">
             <p className="text-sm font-medium text-slate-500">
               Don't have an account? <button className="text-indigo-600 font-bold hover:underline">Contact Admin</button>
             </p>
          </div>
        </div>
        
        {/* Minimal Support Links Bottom Right */}
        <div className="absolute bottom-6 right-8 hidden lg:flex items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-2 text-slate-600">
             <ShieldCheck size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Secure</span>
           </div>
        </div>
      </div>
      
    </div>
  );
};

export default Login;
