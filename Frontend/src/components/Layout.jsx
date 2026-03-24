import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { User, LayoutDashboard, Database, PieChart, FileText, Settings, Github, Share2, LogOut, ChevronUp, ExternalLink, Code, Activity, Mail, X, Copy, Check, Layers } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../lib/axios';

const SidebarLink = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center space-x-3 px-6 py-4 transition-all duration-300 border-l-4 ${
        isActive
          ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
          : "border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
      }`
    }
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

export function Layout() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);
  
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = loggedInUser.student?.slug === username;
  
  // For the sidebar info, if we are the owner, use our info. 
  // If not, we might need to fetch the student info, but for now we can rely on the page components to fetch.
  // However, the Layout sidebar displays the student's name.
  // For a guest visiting /username, we should show that username's info if possible.
  const student = isOwner ? (loggedInUser.student || {}) : {};
  const fullName = isOwner ? (student.fullName || loggedInUser.username || "Student") : username;
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/users/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      navigate('/login');
    }
  };

  const shareUrl = `${window.location.origin}/${username}/portfolio`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-50">
        <div className="p-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg overflow-hidden">
                <div className="h-full w-full bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">S</div>
            </div>
            <span className="text-gradient font-black tracking-tightest">Portal</span>
          </h1>
        </div>

        <nav className="flex-1 mt-4">
          <SidebarLink to={`/${username}`} icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink to={`/${username}/portfolio`} icon={User} label="Portfolio" />
          <SidebarLink to={`/${username}/projects`} icon={Layers} label="Projects" />
          {isOwner && (
            <>
              <SidebarLink to={`/${username}/resume-builder`} icon={FileText} label="Resume Builder" />
              <SidebarLink to={`/${username}/inbox`} icon={Mail} label="Inbox" />
            </>
          )}
        </nav>

        {isOwner ? (
          <div className="p-4 border-t border-slate-800 relative" ref={menuRef}>
            {showUserMenu && (
                <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-[60]">
                    <div className="p-4 border-b border-slate-800 bg-indigo-600/5">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Account</p>
                        <button 
                            onClick={() => {
                                navigate(`/${username}/settings`);
                                setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-all mb-4"
                        >
                            <Settings size={16} />
                            <span>Manage Profile</span>
                        </button>
                        
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Quick Links</p>
                        <div className="space-y-1">
                            {student.githubUsername && (
                                <a href={`https://github.com/${student.githubUsername}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-slate-300 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <Github size={16} className="text-slate-500" />
                                        <span className="text-sm font-bold">GitHub</span>
                                    </div>
                                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-6 py-4 text-pink-500 hover:bg-pink-500/5 transition-all transition-colors duration-200"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-bold uppercase tracking-widest">Sign Out</span>
                    </button>
                </div>
            )}

            <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                    showUserMenu ? "bg-slate-800 border-slate-700 shadow-lg" : "border-transparent hover:bg-slate-800/50"
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/20">
                        <div className="h-full w-full rounded-[10px] bg-slate-900 flex items-center justify-center text-xs font-black text-white uppercase tracking-tighter">
                            {initials}
                        </div>
                    </div>
                    <div className="text-left overflow-hidden">
                        <p className="text-xs font-black text-white uppercase truncate">{fullName}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{student.year ? `${student.year} Year` : 'Student'}</p>
                    </div>
                </div>
                <ChevronUp size={16} className={`text-slate-500 transition-transform duration-300 ${showUserMenu ? "rotate-0" : "rotate-180"}`} />
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-slate-800">
            <button 
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all"
            >
                <User size={16} />
                <span>Sign In</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10 bg-gradient-mesh min-h-screen">
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800/50">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight italic uppercase italic">Academic Workspace</h2>
            <p className="text-slate-400 mt-1 font-medium italic">Manage your digital presence and academic record.</p>
          </div>
          <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowShareModal(true)}
                className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg group"
              >
                  <Share2 size={18} className="group-hover:text-indigo-400 transition-colors" />
              </button>
          </div>
        </header>

        <Outlet />
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Share Portfolio</h3>
                  <p className="text-slate-500 text-xs font-medium italic">Spread your profile link with recruiters and peers.</p>
                </div>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="p-6 bg-slate-950 border border-white/5 rounded-3xl group hover:border-indigo-500/30 transition-all">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">Public Profile URL</p>
                  <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
                    <input 
                      type="text" 
                      readOnly 
                      value={shareUrl}
                      className="flex-1 bg-transparent border-none text-slate-300 text-sm font-medium focus:ring-0 px-2"
                    />
                    <button 
                      onClick={handleCopyLink}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                        copied 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
                      }`}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-sm font-bold text-white uppercase italic tracking-tighter">Live & Public</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Visibility</p>
                      <p className="text-sm font-bold text-white uppercase italic tracking-tighter">Global Access</p>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
