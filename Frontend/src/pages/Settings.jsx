import React, { useState } from 'react';
import { User, Github, Code, Activity, Save, Globe, MapPin, Phone, GraduationCap, Briefcase, X } from 'lucide-react';
import API from '../lib/axios';
import toast from 'react-hot-toast';

export function Settings() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const student = user.student || {};
    
    const [formData, setFormData] = useState({
        fullName: student.fullName || "",
        slug: student.slug || "",
        branch: student.branch || "",
        year: student.year || "",
        graduationYear: student.graduationYear || "",
        profileDescription: student.profileDescription || "",
        bio: student.bio ||"",
        githubUsername: student.githubUsername || "",
        profilePhotoUrl: student.profilePhotoUrl || "https://www.svgrepo.com/show/520490/student.svg",
        leetcodeUrl: student.leetcodeUrl || "",
        codeforcesUrl: student.codeforcesUrl || "",
        linkedinUrl: student.linkedinUrl || "",
        xUrl: student.xUrl || "",
        location: student.location || "",
        phone: student.phone || "",
        isPublic: student.isPublic ?? true 
    });

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (profilePhoto) {
                data.append('profilePhoto', profilePhoto);
            }

            const response = await API.put("/students/profile", data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Update local storage with new student data
            const updatedUser = { ...user, student: response.data.data };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Update error detail:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-count pb-20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tightest">Profile Settings</h1>
                    <p className="text-slate-400 mt-2 font-medium italic">Customize your digital identity and professional links.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary flex items-center gap-2 px-10 py-4 shadow-[0_0_30px_rgba(79,70,229,0.2)] disabled:opacity-50"
                >
                    <Save size={20} />
                    <span>{isSaving ? "Saving Changes..." : "Save Profile"}</span>
                </button>

            </div>

            <form className="space-y-12">
                {/* Basic Information */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <User className="text-indigo-500" size={24} />
                        <h3 className="text-xl font-black text-white uppercase tracking-widest italic">Personal Basics</h3>
                    <div className="flex-1 h-px bg-slate-800"></div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-slate-800 group-hover:border-indigo-500 transition-all shadow-2xl bg-slate-900 flex items-center justify-center">
                                {profilePhoto ? (
                                    <img src={URL.createObjectURL(profilePhoto)} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <img src={formData.profilePhotoUrl || "https://www.svgrepo.com/show/520490/student.svg"} alt="Profile" className="w-full h-full object-cover" />
                                )}
                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Activity size={24} className="text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setProfilePhoto(e.target.files[0])} />
                                </label>
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3 text-center">Change Photo</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 w-full">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input 
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                type="text" 
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Profile Slug (Unique URL)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-sm">/p/</span>
                                <input 
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    type="text" 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 pl-12 text-indigo-400 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Professional Headline / Bio</label>
                        <textarea 
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4" 
                            placeholder="Full Stack Developer passionate about crafting refined digital experiences..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-300 focus:outline-none focus:border-indigo-500 transition-all font-medium leading-relaxed italic"
                        />
                    </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Branch / Major</label>
                            <input 
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                type="text" 
                                placeholder="e.g. Computer Science"
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Year</label>
                            <input 
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                type="number" 
                                placeholder="3"
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input 
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    type="text" 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 pl-12 text-slate-300 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">About</label>
                        <textarea 
                            name="profileDescription"
                            value={formData.profileDescription}
                            onChange={handleChange}
                            rows="4" 
                            placeholder="Full Stack Developer passionate about crafting refined digital experiences..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-300 focus:outline-none focus:border-indigo-500 transition-all font-medium leading-relaxed italic"
                        />
                    </div>

                </section>

                {/* Professional Links */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <Globe className="text-purple-500" size={24} />
                        <h3 className="text-xl font-black text-white uppercase tracking-widest italic">Digital Footprint</h3>
                        <div className="flex-1 h-px bg-slate-800"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                <Github size={12} /> GitHub Username
                            </label>
                            <input 
                                name="githubUsername"
                                value={formData.githubUsername}
                                onChange={handleChange}
                                type="text" 
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                <Code size={12} /> LeetCode Profile URL
                            </label>
                            <input 
                                name="leetcodeUrl"
                                value={formData.leetcodeUrl}
                                onChange={handleChange}
                                type="url" 
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                <Activity size={12} /> Codeforces Profile URL
                            </label>
                            <input 
                                name="codeforcesUrl"
                                value={formData.codeforcesUrl}
                                onChange={handleChange}
                                type="url" 
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                <Briefcase size={12} /> LinkedIn URL
                            </label>
                            <input 
                                name="linkedinUrl"
                                value={formData.linkedinUrl}
                                onChange={handleChange}
                                type="url" 
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                <X size={12} /> X (Twitter) URL
                            </label>
                            <input 
                                name="xUrl"
                                value={formData.xUrl}
                                onChange={handleChange}
                                type="url" 
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500 transition-all font-bold" 
                            />
                        </div>
                    </div>
                </section>
            </form>
        </div>
    );
}
