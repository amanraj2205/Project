import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Github, Linkedin, ExternalLink, Mail, Award, BookOpen, Code, Briefcase, ChevronRight, Download, Terminal, Database, Smartphone, Globe, Layers, Zap, Plus, X, Trash2, Home, Menu, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../lib/axios';
import toast from 'react-hot-toast';

import { GitHubCalendar } from 'react-github-calendar';

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-10">
    <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tighter">{title}</h2>
    <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase italic">{subtitle}</p>
  </div>
);

export function PublicPortfolio() {
  const { username } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    senderName: '',
    senderEmail: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'skill', 'experience', 'project', 'academic', 'achievement'
  
  const userStr = localStorage.getItem('user');
  const loggedInUser = userStr ? JSON.parse(userStr) : null;
  const isOwner = loggedInUser?.student?.slug === username;

  const [skillForm, setSkillForm] = useState({ name: '', level: 'Intermediate' });
  const [expForm, setExpForm] = useState({ title: '', company: '', location: '', description: '', startDate: '', endDate: '', isCurrent: false });
  const [projectForm, setProjectForm] = useState({ title: '', shortDescription: '', techStack: '', githubUrl: '', demoUrl: '', role: '', startDate: '', endDate: '' });
  const [academicForm, setAcademicForm] = useState({ level: '', institution: '', boardOrUniversity: '', courseOrStream: '', startYear: '', endYear: '', cgpaOrPercentage: '' });
  const [achievementForm, setAchievementForm] = useState({ title: '', type: '', organization: '', positionOrScore: '', date: '', proofUrl: '' });
  
  const [projectImage, setProjectImage] = useState(null);
  const [isProjectSubmitting, setIsProjectSubmitting] = useState(false);
  const [showAllExperiences, setShowAllExperiences] = useState(false);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllAcademics, setShowAllAcademics] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
    else setIsSidebarOpen(true);
  }, [isMobile]);

  const fetchProfile = async () => {
    try {
      const response = await API.get(`students/p/${username}`);
      setStudent(response.data.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Profile not found or is private");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center text-white">
        <h1 className="text-2xl font-bold">Profile Not Found</h1> 
      </div>
    );
  }

  const { fullName, profileDescription, bio, skills, experiences, projects, githubUsername, academics, achievements, linkedinUrl, xUrl } = student;
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await API.post(`/contacts/p/${username}`, contactForm);
      toast.success("Message sent successfully!");
      setContactForm({ senderName: '', senderEmail: '', message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await API.post('/students/skills', skillForm);
      toast.success("Skill added!");
      setActiveModal(null);
      setSkillForm({ name: '', level: 'Intermediate' });
      fetchProfile();
    } catch (err) { toast.error("Failed to add skill"); }
  };

  const handleAddExp = async (e) => {
    e.preventDefault();
    try {
      await API.post('/students/experiences', expForm);
      toast.success("Experience added!");
      setActiveModal(null);
      setExpForm({ title: '', company: '', location: '', description: '', startDate: '', endDate: '', isCurrent: false });
      fetchProfile();
    } catch (err) { toast.error("Failed to add experience"); }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setIsProjectSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(projectForm).forEach(key => {
        data.append(key, projectForm[key]);
      });
      if (projectImage) {
        data.append('image', projectImage);
      }

      await API.post('/projects', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success("Project added!");
      setActiveModal(null);
      setProjectForm({ title: '', shortDescription: '', techStack: '', githubUrl: '', demoUrl: '', role: '', startDate: '', endDate: '' });
      setProjectImage(null);
      fetchProfile();
    } catch (err) { 
      console.error(err);
      toast.error("Failed to add project"); 
    } finally {
      setIsProjectSubmitting(false);
    }
  };

  const handleAddAcademic = async (e) => {
    e.preventDefault();
    try {
      await API.post('/students/academics', {
         ...academicForm,
         startYear: parseInt(academicForm.startYear) || null,
         endYear: parseInt(academicForm.endYear) || null
      });
      toast.success("Academic record added!");
      setActiveModal(null);
      setAcademicForm({ level: '', institution: '', boardOrUniversity: '', courseOrStream: '', startYear: '', endYear: '', cgpaOrPercentage: '' });
      fetchProfile();
    } catch (err) { toast.error("Failed to add academic record"); }
  };

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    try {
      await API.post('/students/achievements', achievementForm);
      toast.success("Achievement added!");
      setActiveModal(null);
      setAchievementForm({ title: '', type: '', organization: '', positionOrScore: '', date: '', proofUrl: '' });
      fetchProfile();
    } catch (err) { toast.error("Failed to add achievement"); }
  };

  const handleDeleteItem = async (type, id) => {
    if(!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await API.delete(`/students/${type}/${id}`);
      toast.success("Item deleted!");
      fetchProfile();
    } catch(err) { toast.error("Failed to delete item"); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-slate-100 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .fade-mask {
          mask-image: linear-gradient(to right, transparent, black 50px, black calc(100% - 50px), transparent);
        }
        
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
      {/* Sidebar Toggle Button (Mobile & Desktop when sidebar is hidden) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        className={`fixed top-8 left-8 z-[60] p-4 bg-[#111122]/80 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-indigo-600 transition-all shadow-2xl ${isSidebarOpen ? 'opacity-0 pointer-events-none translate-x-[-20px]' : 'opacity-100 translate-x-0'}`}
      >
        <Menu size={24} />
      </button>

      <PortfolioSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} profileDescription={profileDescription} bio={bio} />

      <motion.div 
        animate={{ 
          paddingLeft: (isSidebarOpen && !isMobile) ? '320px' : '0px',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="min-h-screen p-10 lg:p-24 relative"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 blur-[180px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[180px] rounded-full"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-24">
        
        {/* HERO SECTION */}
        <header id="hero" className="flex flex-col lg:flex-row items-center gap-16 mb-24 lg:pt-10">
           {/* Profile Photo Wrapper */}
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-shrink-0">
               <div className="h-80 w-80 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                     <div className="w-full h-full bg-slate-900 flex items-center justify-center text-7xl font-black text-white/10 uppercase tracking-tighter">
                       {student.profilePhotoUrl ? <img src={student.profilePhotoUrl} alt={fullName} className="w-full h-full object-cover" /> : initials}
                     </div>
                     <div className="absolute bottom-8 left-8 z-20">
                          <div className="h-1 w-12 bg-indigo-500 mb-2"></div>
                          <p className="text-white text-xs font-black uppercase tracking-widest">Active Now</p>
                     </div>
                </div>
            </motion.div>
 
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 space-y-6">
               <h1 className="text-6xl lg:text-7xl font-black text-white tracking-tight">
                 Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{fullName}</span>
               </h1>
               <p className="text-2xl text-slate-400 font-medium tracking-tight">{bio || profileDescription || "Full Stack Developer"}</p>
           </motion.div>
        </header>

        {/* ROW-WISE SECTIONS - Single Column Layout */}
        <div className="flex flex-col gap-32">
             
             {/* About Section */}
             {profileDescription && profileDescription !== bio && (
                 <section id="about" className="max-w-4xl">
                      <SectionHeader title="About Me" subtitle="A brief introduction" />
                      <div className="relative group">
                          <p className={`text-slate-400 text-lg lg:text-xl leading-relaxed font-medium italic bg-white/5 p-8 lg:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl transition-all duration-500 ${!showFullAbout && 'line-clamp-6'}`}>
                             {profileDescription}
                          </p>
                          {profileDescription.length > 400 && (
                              <button 
                                onClick={() => setShowFullAbout(!showFullAbout)}
                                className="mt-4 ml-8 text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors flex items-center gap-2"
                              >
                                {showFullAbout ? "Show Less" : "Read More"}
                                <ChevronRight size={14} className={showFullAbout ? "-rotate-90 transition-transform" : "rotate-0 transition-transform"} />
                              </button>
                          )}
                      </div>
                 </section>
             )}

             {/* Skills Section */}
             <section id="skills">
                 <div className="flex justify-between items-center mb-12">
                     <SectionHeader title="Technical Skills" subtitle="Core competencies & tech stack" />
                     {isOwner && (
                         <button onClick={() => setActiveModal('skill')} className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white transition-all shadow-lg hover:shadow-indigo-500/20">
                             <Plus size={24} />
                         </button>
                     )}
                 </div>
                 <div className="flex flex-wrap gap-4 lg:gap-6">
                     {skills && skills.length > 0 ? (
                        (showAllSkills ? skills : skills.slice(0, 10)).map(skill => (
                          <SkillBadge 
                             key={skill.id} 
                             icon={Code} 
                             label={skill.name} 
                             color="#6366f1" 
                             isOwner={isOwner}
                             onDelete={() => handleDeleteItem('skills', skill.id)}
                          />
                        ))
                     ) : (
                       <p className="text-slate-500 italic font-medium">No skills listed yet.</p>
                     )}
                 </div>
                 {skills && skills.length > 10 && (
                    <button 
                        onClick={() => setShowAllSkills(!showAllSkills)}
                        className="mt-8 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-2"
                    >
                        {showAllSkills ? "View Less" : `View ${skills.length - 10} More Skills`}
                        <ChevronRight size={14} className={showAllSkills ? "-rotate-90 transition-transform" : "rotate-0 transition-transform"} />
                    </button>
                 )}
             </section>

             {/* Experience Timeline */}
             <section id="experience" className="max-w-5xl">
                 <div className="flex justify-between items-center mb-12">
                     <SectionHeader title="Professional Experience" subtitle="Work history & internships" />
                     {isOwner && (
                         <button onClick={() => setActiveModal('experience')} className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white transition-all shadow-lg hover:shadow-indigo-500/20">
                             <Plus size={24} />
                         </button>
                     )}
                 </div>
                 <div className="space-y-12 pl-6 border-l-2 border-white/5">
                     {experiences && experiences.length > 0 ? (
                         <div className="space-y-12">
                             {experiences.slice(0, showAllExperiences ? experiences.length : 3).map(exp => (
                               <ExperienceItem 
                                   key={exp.id}
                                   dotColor="#6366f1"
                                   title={exp.title} 
                                   subtitle={`${exp.company}${exp.startDate ? ` — ${new Date(exp.startDate).getFullYear()}` : ''}`}
                                   desc={exp.description} 
                                   isOwner={isOwner}
                                   onDelete={() => handleDeleteItem('experiences', exp.id)}
                               />
                             ))}
                             {experiences.length > 3 && (
                                <div className="flex justify-start pt-4">
                                    <button onClick={() => setShowAllExperiences(!showAllExperiences)} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-all bg-indigo-500/10 px-8 py-4 rounded-2xl border border-indigo-500/20 hover:bg-indigo-500/20 shadow-xl shadow-indigo-500/5">
                                        {showAllExperiences ? "View Less" : `View all ${experiences.length} experiences`} <ChevronRight size={16} className={showAllExperiences ? "-rotate-90 transition-transform" : "rotate-0 transition-transform"} />
                                    </button>
                                </div>
                             )}
                         </div>
                     ) : (
                       <p className="text-slate-500 italic font-medium">No experience history available.</p>
                     )}
                 </div>
             </section>

             {/* Project Grid / Scroller */}
             <section id="projects">
                <div className="flex justify-between items-end mb-12">
                    <SectionHeader title="Portfolio Gallery" subtitle="Horizontal showcase of creative work" />
                    <div className="hidden lg:flex gap-4 mb-10">
                         <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                             <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="h-full w-12 bg-indigo-500/50"></motion.div>
                         </div>
                    </div>
                </div>
                
                {projects && projects.length > 0 ? (
                  <div className="relative group">
                      {/* Custom Horizontal Scroller */}
                      <div className="flex gap-8 overflow-x-auto pb-12 pt-4 px-4 -mx-4 no-scrollbar fade-mask snap-x snap-mandatory cursor-grab active:cursor-grabbing">
                          {projects.map(project => (
                            <div key={project.id} className="min-w-[320px] md:min-w-[450px] snap-center first:pl-4 last:pr-4">
                                <ProjectCard 
                                  title={project.title} 
                                  imgPlaceholder={project.title.slice(0, 2).toUpperCase()} 
                                  githubUrl={project.githubUrl}
                                  demoUrl={project.demoUrl}
                                  role={project.role}
                                  shortDescription={project.shortDescription}
                                  techStack={project.techStack}
                                  imageUrl={project.imageUrl}
                                />
                            </div>
                          ))}
                      </div>
                      
                      {/* Scroll Hint */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 pointer-events-none">
                           <div className="h-[2px] w-8 bg-indigo-500/50"></div>
                           <div className="h-[2px] w-4 bg-white/10"></div>
                           <div className="h-[2px] w-4 bg-white/10"></div>
                      </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic font-medium">No projects shared on this profile yet.</p>
                )}
             </section>

             {/* Academics Section */}
             <section id="academics" className="max-w-5xl">
                 <div className="flex justify-between items-center mb-12">
                     <SectionHeader title="Education" subtitle="Academic background & qualifications" />
                     {isOwner && (
                         <button onClick={() => setActiveModal('academic')} className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white transition-all shadow-lg hover:shadow-indigo-500/20">
                             <Plus size={24} />
                         </button>
                     )}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {academics && academics.length > 0 ? (
                         (showAllAcademics ? academics : academics.slice(0, 2)).map(acad => (
                           <AcademicItem 
                               key={acad.id}
                               isOwner={isOwner}
                               onDelete={() => handleDeleteItem('academics', acad.id)}
                               title={`${acad.level} in ${acad.courseOrStream || acad.institution}`} 
                               subtitle={`${acad.institution} ${acad.startYear ? `(${acad.startYear} - ${acad.endYear || 'Present'})` : ''}`}
                               cgpa={acad.cgpaOrPercentage}
                           />
                         ))
                     ) : (
                       <p className="text-slate-500 italic font-medium">Educational background pending.</p>
                     )}
                 </div>
                 {academics && academics.length > 2 && (
                    <button 
                        onClick={() => setShowAllAcademics(!showAllAcademics)}
                        className="mt-8 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-2"
                    >
                        {showAllAcademics ? "Show Less" : "Show All Education"}
                        <ChevronRight size={14} className={showAllAcademics ? "-rotate-90 transition-transform" : "rotate-0 transition-transform"} />
                    </button>
                 )}
             </section>

             {/* Achievements */}
             <section id="achievements" className="max-w-5xl">
                <div className="flex justify-between items-center mb-12">
                    <SectionHeader title="Achievements" subtitle="Notable awards & certifications" />
                    {isOwner && (
                        <button onClick={() => setActiveModal('achievement')} className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white transition-all shadow-lg hover:shadow-indigo-500/20">
                            <Plus size={24} />
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {achievements && achievements.length > 0 ? (
                      (showAllAchievements ? achievements : achievements.slice(0, 4)).map(ach => (
                        <AchievementItem 
                          key={ach.id}
                          isOwner={isOwner}
                          onDelete={() => handleDeleteItem('achievements', ach.id)}
                          title={ach.title} 
                          org={ach.organization}
                          date={ach.date}
                        />
                      ))
                    ) : (
                      <p className="text-slate-500 italic font-medium">Achievements not listed.</p>
                    )}
                </div>
                {achievements && achievements.length > 4 && (
                    <button 
                        onClick={() => setShowAllAchievements(!showAllAchievements)}
                        className="mt-8 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-2"
                    >
                        {showAllAchievements ? "Show Less" : `Show all ${achievements.length} achievements`}
                        <ChevronRight size={14} className={showAllAchievements ? "-rotate-90 transition-transform" : "rotate-0 transition-transform"} />
                    </button>
                 )}
             </section>

            {/* Sync GitHub Sync Widget */}
            <section className="bg-white/5 p-12 lg:p-16 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[120px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>
               <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                   <div className="space-y-4 text-center lg:text-left">
                      <div className="flex items-center gap-4 justify-center lg:justify-start mb-2">
                         <Github className="text-white bg-white/10 p-2 rounded-xl" size={40} />
                         <h3 className="text-3xl font-black text-white leading-tight uppercase italic tracking-tighter">Contribution Matrix</h3>
                      </div>
                      <p className="text-slate-400 text-lg font-medium italic max-w-md">Real-time visualization of developer activity and open source contributions from GitHub.</p>
                   </div>
                   
                   <div className="bg-slate-950/40 p-10 rounded-[2rem] border border-white/5 backdrop-blur-md shadow-inner">
                       {githubUsername ? (
                           <div className="scale-75 md:scale-100 origin-center">
                               <GitHubCalendar username={githubUsername} colorScheme="dark" />
                           </div>
                       ) : (
                           <p className="text-slate-500 italic text-sm">GitHub account link required for visualization.</p>
                       )}
                   </div>
               </div>
            </section>
        </div>

        {/* Contact Center */}
        <section id="contact" className="bg-[#1a1a2e] p-12 rounded-[2.5rem] border border-white/5 space-y-10">
            <SectionHeader title="Contact Center" subtitle="Direct message line for recruiters" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div className="space-y-6">
                    <p className="text-slate-400 text-lg leading-relaxed font-medium italic">Interested in collaborating or hiring? Send me a direct inquiry and I'll get back to you within 24 hours.</p>
                    <div className="flex items-center gap-6">
                        {linkedinUrl && (
                            <a href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`} target="_blank" rel="noreferrer" className="p-4 bg-white/5 rounded-3xl border border-white/10 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-all transform hover:-translate-y-1 shadow-xl group">
                                <Linkedin size={28} className="group-hover:scale-110 transition-transform" />
                            </a>
                        )}
                        {xUrl && (
                            <a href={xUrl.startsWith('http') ? xUrl : `https://${xUrl}`} target="_blank" rel="noreferrer" className="p-4 bg-white/5 rounded-3xl border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all transform hover:-translate-y-1 shadow-xl group">
                                <X size={28} className="group-hover:scale-110 transition-transform" />
                            </a>
                        )}
                        {!linkedinUrl && !xUrl && (
                            <p className="text-slate-500 text-sm font-medium italic">Social profiles not linked.</p>
                        )}
                    </div>
                 </div>
                 <form onSubmit={handleContactSubmit} className="space-y-6">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      required
                      className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 focus:outline-none focus:border-indigo-500/50 transition-all text-slate-300"
                      value={contactForm.senderName}
                      onChange={(e) => setContactForm({...contactForm, senderName: e.target.value})}
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      required
                      className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 focus:outline-none focus:border-indigo-500/50 transition-all text-slate-300"
                      value={contactForm.senderEmail}
                      onChange={(e) => setContactForm({...contactForm, senderEmail: e.target.value})}
                    />
                    <textarea 
                      placeholder="How can I help you?" 
                      rows="4" 
                      required
                      className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 focus:outline-none focus:border-indigo-500/50 transition-all text-slate-300"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    />
                    <button 
                      type="submit"
                      disabled={isSending}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50"
                    >
                      {isSending ? "Sending..." : "Send Inquiry"}
                    </button>
                 </form>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-24 text-center border-t border-white/5">
            <p className="text-slate-500 italic mt-4">© 2026 StudentPortal. All Rights Reserved.</p>
        </footer>

      </div>

      {/* MODALS */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#111122] border border-white/10 p-8 rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl maxHeight-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-black text-white uppercase italic">Add {activeModal}</h3>
                 <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
              </div>

              {activeModal === 'skill' && (
                <form onSubmit={handleAddSkill} className="space-y-4">
                  <input required placeholder="Skill Name (e.g. React)" value={skillForm.name} onChange={e => setSkillForm({...skillForm, name: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500" />
                  <select value={skillForm.level} onChange={e => setSkillForm({...skillForm, level: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500">
                      <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
                  </select>
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl">Add Skill</button>
                </form>
              )}

              {activeModal === 'experience' && (
                <form onSubmit={handleAddExp} className="space-y-4">
                  <input required placeholder="Job Title" value={expForm.title} onChange={e => setExpForm({...expForm, title: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none" />
                  <input required placeholder="Company" value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none" />
                  <input placeholder="Location" value={expForm.location} onChange={e => setExpForm({...expForm, location: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none" />
                  <textarea placeholder="Description" value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none" rows="3" />
                  <div className="flex gap-4">
                      <input type="date" value={expForm.startDate} onChange={e => setExpForm({...expForm, startDate: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-slate-400 focus:outline-none" title="Start Date" />
                      {!expForm.isCurrent && (
                          <input type="date" value={expForm.endDate} onChange={e => setExpForm({...expForm, endDate: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-slate-400 focus:outline-none" title="End Date" />
                      )}
                  </div>
                  <label className="flex items-center gap-2 text-slate-300 font-medium cursor-pointer">
                      <input type="checkbox" checked={expForm.isCurrent} onChange={e => setExpForm({...expForm, isCurrent: e.target.checked})} className="accent-indigo-500 w-4 h-4" />
                      I currently work here
                  </label>
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl">Add Experience</button>
                </form>
              )}

              {activeModal === 'academic' && (
                <form onSubmit={handleAddAcademic} className="space-y-4">
                  <input required placeholder="Level (e.g. B.Tech, High School)" value={academicForm.level} onChange={e => setAcademicForm({...academicForm, level: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500" />
                  <input required placeholder="Institution Name" value={academicForm.institution} onChange={e => setAcademicForm({...academicForm, institution: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500" />
                  <input placeholder="Course/Stream (e.g. Computer Science)" value={academicForm.courseOrStream} onChange={e => setAcademicForm({...academicForm, courseOrStream: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500" />
                  <div className="flex gap-4">
                      <input type="number" placeholder="Start Year" value={academicForm.startYear} onChange={e => setAcademicForm({...academicForm, startYear: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-slate-400 focus:outline-none" />
                      <input type="number" placeholder="End Year" value={academicForm.endYear} onChange={e => setAcademicForm({...academicForm, endYear: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-slate-400 focus:outline-none" />
                  </div>
                  <input placeholder="CGPA or Percentage" value={academicForm.cgpaOrPercentage} onChange={e => setAcademicForm({...academicForm, cgpaOrPercentage: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500" />
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-colors">Add Academic Record</button>
                </form>
              )}

              {activeModal === 'achievement' && (
                <form onSubmit={handleAddAchievement} className="space-y-4">
                  <input required placeholder="Achievement Title" value={achievementForm.title} onChange={e => setAchievementForm({...achievementForm, title: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500" />
                  <input placeholder="Organization / Issuer" value={achievementForm.organization} onChange={e => setAchievementForm({...achievementForm, organization: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500" />
                  <input type="date" value={achievementForm.date} onChange={e => setAchievementForm({...achievementForm, date: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-slate-400 focus:outline-none" />
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-colors">Add Achievement</button>
                </form>
              )}

              {activeModal === 'project' && (
                <form onSubmit={handleAddProject} className="space-y-4">
                  <input required placeholder="Project Title" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none" />
                  <textarea placeholder="Short Description" value={projectForm.shortDescription} onChange={e => setProjectForm({...projectForm, shortDescription: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none" />
                  <input placeholder="Tech Stack (comma separated)" value={projectForm.techStack} onChange={e => setProjectForm({...projectForm, techStack: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none" />
                  <input placeholder="GitHub URL" value={projectForm.githubUrl} onChange={e => setProjectForm({...projectForm, githubUrl: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-white focus:outline-none" />
                  <div className="flex gap-4">
                      <input type="date" value={projectForm.startDate} onChange={e => setProjectForm({...projectForm, startDate: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-slate-400 focus:outline-none" />
                      <input type="date" value={projectForm.endDate} onChange={e => setProjectForm({...projectForm, endDate: e.target.value})} className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-slate-400 focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Image</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => setProjectImage(e.target.files[0])}
                      className="w-full bg-[#0a0a1a] border border-white/5 rounded-2xl p-4 text-slate-400 focus:outline-none text-sm" 
                    />
                    {projectImage && <p className="text-[10px] text-indigo-400 font-bold italic ml-1">Selected: {projectImage.name}</p>}
                  </div>
                  <button type="submit" disabled={isProjectSubmitting} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-colors disabled:opacity-50">
                    {isProjectSubmitting ? "Adding..." : "Add Project"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
}

const PortfolioSidebar = ({ isOpen, setIsOpen, profileDescription, bio }) => {
  const menuItems = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: User, condition: profileDescription && profileDescription !== bio },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'academics', label: 'Academics', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'achievements', label: 'Awards', icon: Award },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
        {/* Backdrop for mobile */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
        />
        <motion.aside 
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="fixed left-0 top-0 h-full w-80 bg-[#0d0d1e]/90 backdrop-blur-xl border-r border-white/5 z-50 p-10 flex flex-col shadow-2xl"
        >
          <div className="flex justify-between items-center mb-16">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Navigator</h2>
             </div>
             <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors">
                <X size={20} />
             </button>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto pr-2 custom-scrollbar">
             {menuItems.map((item) => (
                (item.condition === undefined || item.condition) && (
                  <button 
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest group"
                  >
                    <item.icon size={18} className="group-hover:text-indigo-400 transition-colors" />
                    <span>{item.label}</span>
                  </button>
                )
             ))}
          </nav>

          <div className="pt-10 border-t border-white/5 mt-auto">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 italic">© 2026 Student Portal</p>
          </div>
        </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

const SkillBadge = ({ icon: Icon, label, color, isOwner, onDelete }) => (
    <div className="flex justify-between items-center gap-2 px-5 py-3 bg-[#111122] rounded-full border border-white/5 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all">
        <div style={{ borderColor: color }} className="absolute inset-0 border-2 rounded-full opacity-30 shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-none"></div>
        <div className="flex items-center gap-3">
          <Icon size={16} style={{ color: color }} />
          <span className="text-[11px] font-black text-slate-100 uppercase tracking-tighter italic">{label}</span>
        </div>
        {isOwner && (
          <button onClick={onDelete} className="ml-2 text-slate-600 hover:text-red-500 transition-colors z-10">
            <Trash2 size={14} />
          </button>
        )}
    </div>
);

const ProjectCard = ({ title, imgPlaceholder, githubUrl, demoUrl, role, shortDescription, techStack, imageUrl }) => {
    // Determine a gradient based on the title to give projects distinct colors
    const checksum = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
        "from-indigo-500/20 to-purple-500/5 border-indigo-500/20",
        "from-emerald-500/20 to-teal-500/5 border-emerald-500/20",
        "from-rose-500/20 to-orange-500/5 border-rose-500/20",
        "from-blue-500/20 to-cyan-500/5 border-blue-500/20"
    ];
    const gradTheme = gradients[checksum % gradients.length];

    return (
    <div className="bg-[#111122]/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-indigo-500/30 hover:shadow-[0_0_50px_rgba(79,70,229,0.15)] transition-all duration-500 flex flex-col h-full relative">
        {/* Top visual area - Full Fit Image */}
        <div className="h-64 relative overflow-hidden bg-slate-950 flex items-center justify-center border-b border-white/5">
            {imageUrl ? (
                <div className="w-full h-full">
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
            ) : (
                <div className={`w-full h-full bg-gradient-to-br ${gradTheme} relative flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgwem0xOSAxOUgxVjFoMTh2MTh6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-60"></div>
                    <span className="text-8xl font-black text-white/5 uppercase absolute z-0 select-none pointer-events-none tracking-tighter group-hover:text-white/10 transition-colors">{imgPlaceholder}</span>
                    <Code className="text-white/20 group-hover:text-white/40 transition-colors relative z-10" size={60} />
                </div>
            )}
            
            <div className="absolute top-4 right-4 z-20">
                <div className="p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Layers className="text-indigo-400" size={18} />
                </div>
            </div>
        </div>

        {/* Content area */}
        <div className="p-6 flex flex-col flex-1 relative z-10 bg-[#111122] mt-[-1px]">
            <div className="flex-1">
                <div className="flex justify-between items-start mb-3 gap-2">
                    <h4 className="text-white font-black tracking-tight text-lg uppercase leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2">{title}</h4>
                    {role && <span className="bg-white/5 border border-white/10 text-slate-300 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg whitespace-nowrap">{role}</span>}
                </div>
                
                {shortDescription ? (
                   <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-3 mb-5 italic">{shortDescription}</p>
                ) : (
                   <p className="text-xs text-slate-500 font-medium italic mb-5">Documentation pending for this repository.</p>
               )}

                {/* Tech Stack Pills */}
                {techStack && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {techStack.split(',').slice(0, 3).map((tech, i) => (
                            <span key={i} className="text-[9px] font-black uppercase tracking-widest text-slate-300 bg-[#1a1a2e] px-2.5 py-1.5 rounded-md border border-white/5">
                                {tech.trim()}
                            </span>
                        ))}
                        {techStack.split(',').length > 3 && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1 py-1.5">
                                +{techStack.split(',').length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>
            
            {/* Footer actions */}
            <div className="flex items-center justify-between text-slate-500 mt-auto pt-5 border-t border-white/5">
                <div className="flex gap-2">
                    {githubUrl ? (
                         <a href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`} target="_blank" rel="noreferrer" className="p-2 -ml-2 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl transition-all" title="View Source">
                             <Github size={18} />
                         </a>
                    ) : ( <div className="p-2 -ml-2 opacity-20 cursor-not-allowed" title="No Source Code Link"><Github size={18} /></div> )}
                    {demoUrl ? (
                         <a href={demoUrl.startsWith('http') ? demoUrl : `https://${demoUrl}`} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl transition-all" title="Live Demo">
                             <ExternalLink size={18} />
                         </a>
                    ) : ( <div className="p-2 opacity-20 cursor-not-allowed" title="No Live Demo Link"><ExternalLink size={18} /></div> )}
                </div>
            </div>
        </div>
    </div>
    );
};

const ExperienceItem = ({ dotColor, title, subtitle, desc, isOwner, onDelete }) => (
    <div className="relative pl-8 pb-8 last:pb-0 group">
        <div style={{ backgroundColor: dotColor }} className="absolute left-[-11px] top-0 h-5 w-5 rounded-full border-4 border-[#0a0a1a] shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:scale-125 transition-transform z-10"></div>
        <div className="flex justify-between items-start">
             <div>
                 <h4 className="text-lg font-bold text-white mb-1 uppercase tracking-tightest italic group-hover:text-indigo-400 transition-colors">{title}</h4>
                 <p className="text-[10px] text-slate-500 font-medium mb-3">{subtitle}</p>
             </div>
             {isOwner && (
                 <button onClick={onDelete} className="p-2 text-slate-600 hover:text-red-500 transition-colors rounded-xl hover:bg-white/5">
                     <Trash2 size={16} />
                 </button>
             )}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed italic">{desc}</p>
    </div>
);

const AcademicItem = ({ title, subtitle, cgpa, isOwner, onDelete }) => (
    <div className="bg-[#111122] p-6 rounded-3xl border border-white/5 shadow-lg group hover:border-purple-500/30 transition-all flex justify-between items-center">
       <div className="flex items-center gap-5">
          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
             <BookOpen size={24} />
          </div>
          <div>
             <h4 className="text-md font-bold text-white mb-1 uppercase tracking-tight italic">{title}</h4>
             <p className="text-xs text-slate-500 font-medium mb-1">{subtitle}</p>
             {cgpa && <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest">Score: {cgpa}</span>}
          </div>
       </div>
       {isOwner && (
          <button onClick={onDelete} className="p-2 text-slate-600 hover:text-red-500 transition-colors rounded-xl opacity-0 group-hover:opacity-100">
             <Trash2 size={18} />
          </button>
       )}
    </div>
);

const AchievementItem = ({ title, org, date, isOwner, onDelete }) => (
    <div className="bg-[#111122] p-6 rounded-3xl border border-white/5 shadow-lg group hover:border-amber-500/30 transition-all flex justify-between items-center">
       <div className="flex items-center gap-5">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
             <Award size={24} />
          </div>
          <div>
             <h4 className="text-md font-bold text-white mb-1 uppercase tracking-tight italic">{title}</h4>
             <p className="text-xs text-slate-500 font-medium">
                {org} {date && `• ${new Date(date).toLocaleDateString()}`}
             </p>
          </div>
       </div>
       {isOwner && (
          <button onClick={onDelete} className="p-2 text-slate-600 hover:text-red-500 transition-colors rounded-xl opacity-0 group-hover:opacity-100">
             <Trash2 size={18} />
          </button>
       )}
    </div>
);
