import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AtSign, ArrowRight, ShieldCheck, Github, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../lib/axios';
import toast from 'react-hot-toast';

export function Register() {
  const [formData, setFormData] = useState({ 
    username: '', 
    fullName: '', 
    email: '', 
    password: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const response = await API.post("/users/register", formData);
        if (response.status === 201) {
            toast.success("Account created successfully. Please login.");
            navigate('/login');
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Registration failed");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse-slow"></div>
      
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
            <h1 className="text-4xl font-black text-white tracking-tightest uppercase mb-2">Join Portal</h1>
            <p className="text-slate-500 font-medium italic">Your future starts here.</p>
        </div>

        {/* Auth Card */}
        <div className="glass p-10 border-slate-800/80 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <Sparkles size={20} className="text-indigo-400" />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            <input 
                                type="text" 
                                required
                                placeholder="Aman Raj"
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700"
                                value={formData.fullName}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Handle</label>
                        <div className="relative">
                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            <input 
                                type="text" 
                                required
                                placeholder="aman-raj"
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

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
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Secure Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-700"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                </div>

                <button type="submit" className="btn-primary w-full py-5 rounded-2xl flex items-center justify-center gap-3 group relative overflow-hidden mt-4 shadow-xl shadow-indigo-600/20">
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <span className="font-black uppercase tracking-widest relative z-10">Create Account</span>
                    <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </button>
            </form>

            <div className="mt-10 flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">or continue with</span>
                <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            <div className="mt-10 flex gap-4">
                <button className="flex-1 bg-slate-900 border border-slate-800 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all group">
                    <Github size={20} className="text-white group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-white uppercase tracking-tight">GitHub</span>
                </button>
            </div>
        </div>

        {/* Footer Link */}
        <p className="text-center mt-10 text-slate-500 font-medium">
            Already a member? {' '}
            <NavLink to="/login" className="text-indigo-400 font-black uppercase tracking-widest hover:text-indigo-300 transition-colors ml-2">Login</NavLink>
        </p>
      </motion.div>
    </div>
  );
}
