import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Github, RefreshCw, ExternalLink, Trash2, Edit3, Plus, X, Calendar, Link as LinkIcon, Briefcase } from 'lucide-react';
import API from '../lib/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function Projects() {
  const { username } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [projectImage, setProjectImage] = useState(null);
  
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = loggedInUser.student?.slug === username;

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    techStack: "",
    githubUrl: "",
    demoUrl: "",
    role: "",
    startDate: "",
    endDate: "",
    status: "unverified",
    imageUrl: ""
  });

  const fetchProjects = async () => {
    try {
      if (isOwner) {
        // Owner can see all projects including unverified
        const response = await API.get("/projects");
        setProjects(response.data.data);
      } else {
        // Guests see only public projects via profile
        const response = await API.get(`/students/p/${username}`);
        setProjects(response.data.data.projects || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      // FIXED ROUTE: backend expects /github-sync
      await API.post("/projects/github-sync");
      toast.success("Projects synced from GitHub!");
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this project?")) return;
    try {
      await API.delete(`/projects/${id}`);
      toast.success("Project removed");
      fetchProjects();
    } catch (error) {
      toast.error("Failed to remove project");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditProjectId(null);
      setFormData({
        title: "", shortDescription: "", techStack: "", githubUrl: "", demoUrl: "", role: "", startDate: "", endDate: "", status: "unverified", imageUrl: ""
      });
      setProjectImage(null);
  };

  const handleEdit = (project) => {
      setIsEditMode(true);
      setEditProjectId(project.id);
      setFormData({
          title: project.title || "",
          shortDescription: project.shortDescription || "",
          techStack: project.techStack || "",
          githubUrl: project.githubUrl || "",
          demoUrl: project.demoUrl || "",
          role: project.role || "",
          startDate: project.startDate ? project.startDate.split('T')[0] : "",
          endDate: project.endDate ? project.endDate.split('T')[0] : "",
          status: project.status || "unverified"
      });
      setIsModalOpen(true);
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
          data.append(key, formData[key]);
      });
      if (projectImage) {
          data.append('image', projectImage);
      }
      if (isEditMode) {
          data.append('id', editProjectId);
          await API.post("/projects/update", data, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          toast.success("Project updated successfully!");
      } else {
          await API.post("/projects", data, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          toast.success("Project added successfully!");
      }
      resetForm();
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [username, isOwner]);

  return (
    <div className="space-y-8 animate-count">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1e1e3f] p-8 rounded-[2.5rem] border border-white/10 shadow-xl overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">Project Management</h2>
          <p className="text-indigo-200/60 font-medium italic">Build your showcase by syncing repositories or adding manual entries.</p>
        </div>
        <div className="flex gap-4 mt-6 md:mt-0 relative z-10">
             {isOwner && (
               <>
                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-2xl border border-white/10 transition-all flex items-center gap-2 backdrop-blur-sm"
                 >
                     <Plus size={18} />
                     <span>Manual Add</span>
                 </button>
                 <button 
                   onClick={handleSync}
                   disabled={syncing}
                   className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
                 >
                   <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
                   <span>{syncing ? "Syncing..." : "Sync Now"}</span>
                 </button>
               </>
             )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
             <div className="col-span-full text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
             </div>
        ) : projects.length > 0 ? (
          projects.map(project => (
            <motion.div 
              key={project.id} 
              whileHover={{ scale: 1.01, translateY: -5 }}
              className="bg-[#1a1a3a]/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-xl hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all group flex flex-col relative overflow-hidden"
            >
              <div className="flex justify-between mb-6">
                <div className="h-16 w-16 bg-[#0a0a1a] rounded-2xl text-slate-500 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all overflow-hidden flex items-center justify-center border border-white/5 group-hover:border-indigo-500/30">
                    {project.imageUrl ? (
                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                        <Github size={24} />
                    )}
                </div>
                <div className="flex gap-1">
                    {isOwner && (
                        <button onClick={() => handleEdit(project)} className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-white/5 rounded-xl transition-all" title="Edit Project">
                            <Edit3 size={20} />
                        </button>
                    )}
                    {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <ExternalLink size={20} />
                        </a>
                    )}
                </div>
              </div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight italic group-hover:text-indigo-400 transition-colors">{project.title}</h3>
              <p className="text-slate-400 text-sm font-medium mb-8 flex-1 leading-relaxed italic opacity-80">{project.shortDescription || "A sophisticated project demonstrating technical prowess and innovation."}</p>
              
              <div className="space-y-5 pt-5 border-t border-white/5">
                <div className="flex flex-wrap gap-2">
                    {(project.techStack?.split(',') || ['Development']).map(tech => (
                        <span key={tech} className="text-[9px] font-black uppercase tracking-widest text-slate-300 bg-white/5 px-3 py-1 rounded-lg border border-white/5 group-hover:border-indigo-500/20 group-hover:text-indigo-300 transition-all">
                            {tech.trim()}
                        </span>
                    ))}
                </div>
                {project.role && (
                    <div className="flex items-center gap-2 text-indigo-400/60 text-[10px] font-black uppercase tracking-widest italic group-hover:text-indigo-400 transition-colors">
                        <Briefcase size={12} />
                        <span>{project.role}</span>
                    </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter italic flex items-center gap-1.5 ${
                        project.status === 'featured' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-500/10 text-slate-500 border border-white/5'
                    }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${project.status === 'featured' ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`}></div>
                        {project.status === 'featured' ? 'Featured on Dashboard' : 'Standard View'}
                    </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
            <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-inner">
                <div className="max-w-xs mx-auto space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <Github size={32} />
                    </div>
                    <p className="text-slate-500 font-bold italic">No projects found. Use the sync button or add one manually to get started!</p>
                </div>
            </div>
        )}
      </div>

      {/* Manual Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 px-10">
                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{isEditMode ? "Update Project" : "Enter Project Details"}</h3>
                <button onClick={resetForm} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                    <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-8 border-b border-slate-50 pb-8">
                    <div className="relative group">
                        <div className="w-40 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 group-hover:border-indigo-500 transition-all shadow-lg bg-slate-50 flex items-center justify-center">
                            {projectImage ? (
                                <img src={URL.createObjectURL(projectImage)} alt="Preview" className="w-full h-full object-cover" />
                            ) : formData.imageUrl ? (
                                <img src={formData.imageUrl} alt="Project" className="w-full h-full object-cover" />
                            ) : (
                                <Plus size={24} className="text-slate-300" />
                            )}
                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Update Image</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => setProjectImage(e.target.files[0])} />
                            </label>
                        </div>
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-bold text-slate-900">Project Cover Image</p>
                        <p className="text-xs text-slate-500 italic">Upload a screenshot or promotional graphic for this project. Recommended size: 1000x600px.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Title</label>
                        <input 
                            required name="title" value={formData.title} onChange={handleInputChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                            placeholder="Awesome App"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Role / Position</label>
                        <input 
                            name="role" value={formData.role} onChange={handleInputChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                            placeholder="Lead Developer"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tech Stack (comma separated)</label>
                        <input 
                            name="techStack" value={formData.techStack} onChange={handleInputChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                            placeholder="React, Tailwind, Node.js"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                        <textarea 
                            name="shortDescription" value={formData.shortDescription} onChange={handleInputChange}
                            rows="3"
                            className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] p-4 text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-medium italic" 
                            placeholder="A brief summary of your project..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"><Github size={12}/> GitHub URL</label>
                        <input 
                            name="githubUrl" value={formData.githubUrl} onChange={handleInputChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-bold text-sm" 
                            placeholder="https://github.com/..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"><LinkIcon size={12}/> Demo URL</label>
                        <input 
                            name="demoUrl" value={formData.demoUrl} onChange={handleInputChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-bold text-sm" 
                            placeholder="https://my-app.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"><Calendar size={12}/> Start Date</label>
                        <input 
                            type="date" name="startDate" value={formData.startDate} onChange={handleInputChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"><Calendar size={12}/> End Date (Optional)</label>
                        <input 
                            type="date" name="endDate" value={formData.endDate} onChange={handleInputChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-300 transition-all">
                            <input 
                                type="checkbox" 
                                checked={formData.status === 'featured'} 
                                onChange={(e) => setFormData({...formData, status: e.target.checked ? 'featured' : 'unverified'})}
                                className="w-5 h-5 accent-indigo-600 rounded bg-slate-100 border-none cursor-pointer"
                            />
                            <div>
                                <p className="text-sm font-bold text-slate-900">Show on Dashboard</p>
                                <p className="text-xs font-medium text-slate-500 italic">Feature this project prominently on your main dashboard view.</p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="pt-6 flex justify-end gap-4">
                    {isEditMode && (
                        <button 
                            type="button" 
                            onClick={() => {
                                handleDelete(editProjectId);
                                resetForm();
                            }}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black uppercase tracking-widest text-xs px-6 py-4 rounded-2xl transition-all mr-auto"
                        >
                            Delete Project
                        </button>
                    )}
                    <button 
                        type="button" onClick={resetForm}
                        className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs px-10 py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : (isEditMode ? "Save Changes" : "Add Project")}
                    </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
