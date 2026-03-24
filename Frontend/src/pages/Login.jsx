import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Github, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../lib/axios';
import toast from 'react-hot-toast';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
        const response = await API.post("/users/login", formData);
        if (response.status === 200) {
            toast.success("Welcome back, " + response.data.data.user.username);
            const user = response.data.data.user;
            localStorage.setItem("user", JSON.stringify(user));
            if (user.student?.slug) {
                navigate(`/${user.student.slug}`);
            } else {
                navigate('/');
            }
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Login failed check your credentials");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse-slow"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-md w-full relative z-10"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 mb-6">
                <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tightest uppercase mb-2">Welcome Back</h1>
            <p className="text-slate-500 font-medium italic">Elevate your professional presence.</p>
        </div>

        {/* Auth Card */}
        <div className="glass p-10 border-slate-800/80 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <Sparkles size={20} className="text-indigo-400" />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input 
                            type="email" 
                            required
                            placeholder="name@university.edu"
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center pl-1 pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                        <button type="button" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">Forgot?</button>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            placeholder="••••••••"
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button type="submit" className="btn-primary w-full py-5 rounded-2xl flex items-center justify-center gap-3 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <span className="font-black uppercase tracking-widest relative z-10">Sign In</span>
                    <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </button>
            </form>

            <div className="mt-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">or continue with</span>
                <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            <div className="mt-8 flex gap-4">
                <button className="flex-1 bg-slate-900 border border-slate-800 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all group">
                    <Github size={20} className="text-white group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-white uppercase tracking-tight">GitHub</span>
                </button>
            </div>
        </div>

        {/* Footer Link */}
        <p className="text-center mt-10 text-slate-500 font-medium">
            Don't have an account? {' '}
            <NavLink to="/register" className="text-indigo-400 font-black uppercase tracking-widest hover:text-indigo-300 transition-colors ml-2">Register</NavLink>
        </p>
      </motion.div>
    </div>
  );
}
