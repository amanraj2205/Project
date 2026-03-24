import { motion } from 'framer-motion';
import { Layers, Activity, Star, Eye, Github, Code, Award, ExternalLink, Search, Bell, ChevronDown, Edit3, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../lib/axios';

import { GitHubCalendar } from 'react-github-calendar';

const SkillTag = ({ label, percent, color }) => {
    const colorClasses = {
        yellow: 'bg-yellow-500',
        blue: 'bg-blue-500',
        orange: 'bg-orange-500',
        indigo: 'bg-indigo-500',
        emerald: 'bg-emerald-500'
    };
    const bgClass = colorClasses[color] || 'bg-indigo-500';
    
    return (
        <div className="flex items-center justify-between text-xs mb-3 font-bold">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${bgClass} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                <span className="text-slate-500">{label}</span>
            </div>
            <span className="text-white">{percent}%</span>
        </div>
    );
};

export function Dashboard() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [githubLangs, setGithubLangs] = useState([]);
  const [langsLoading, setLangsLoading] = useState(false);
  
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = loggedInUser.student?.slug === username;

  const fetchGithubLangs = async (ghUsername) => {
    if (!ghUsername) return;
    setLangsLoading(true);
    try {
        // Fetch last 15 repos to get a good sample of languages
        const reposRes = await fetch(`https://api.github.com/users/${ghUsername}/repos?sort=updated&per_page=15`);
        const repos = await reposRes.json();
        
        if (!Array.isArray(repos)) throw new Error("Invalid repos data");

        const langMap = {};
        let totalBytes = 0;

        // Fetch languages for each repo (parallelized)
        await Promise.all(repos.map(async (repo) => {
            try {
                const lRes = await fetch(repo.languages_url);
                const langs = await lRes.json();
                Object.entries(langs).forEach(([lang, bytes]) => {
                    langMap[lang] = (langMap[lang] || 0) + bytes;
                    totalBytes += bytes;
                });
            } catch (e) {
                console.error(`Error fetching languages for ${repo.name}:`, e);
            }
        }));

        const sortedLangs = Object.entries(langMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([label, bytes]) => {
                const lowerLabel = label.toLowerCase();
                return {
                    label,
                    percent: Math.round((bytes / totalBytes) * 100),
                    color: lowerLabel.includes('javascript') ? 'yellow' : 
                           lowerLabel.includes('python') ? 'blue' : 
                           lowerLabel.includes('html') || lowerLabel.includes('css') ? 'orange' : 
                           lowerLabel.includes('typescript') ? 'indigo' :
                           lowerLabel.includes('c++') ? 'blue' : 'indigo'
                };
            });
            
        setGithubLangs(sortedLangs);
    } catch (error) {
        console.error("Error fetching GitHub languages:", error);
    } finally {
        setLangsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const studentRes = await API.get(`/students/p/${username}`);
            const sData = studentRes.data.data;
            setStudentData(sData);
            
            if (sData.githubUsername) {
                fetchGithubLangs(sData.githubUsername);
            }
            
            if (isOwner) {
                const projRes = await API.get("/projects");
                setProjects(projRes.data.data);
            } else {
                setProjects(sData.projects || []);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("User not found");
        } finally {
            setLoading(false);
        }
    };
    fetchDashboardData();
  }, [username, isOwner]);

  if (loading) {
    return (
        <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
  }

  const displayUser = isOwner ? loggedInUser : { username: studentData?.fullName };
  const student = studentData || {};
  const fullName = student.fullName || "Student";
  const branch = student.branch || "I.T";
  const year = student.year || "";
  const bio = student.bio || student.profileDescription || "No bio available.";
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="space-y-8 animate-count bg-[#0a0a1a] text-slate-100 -m-10 p-10 min-h-screen">
      {/* Top Header Mockup */}
      <header className="flex justify-between items-center mb-8">
          <div className="relative flex-1 max-w-xl group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
             <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-[#111122] border border-white/5 rounded-full py-2.5 pl-12 pr-6 text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all shadow-sm"
             />
          </div>
          
          <div className="flex items-center space-x-6 pl-4 border-l border-white/10">
              <button className="relative text-slate-500 hover:text-indigo-400 transition-colors">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full border-2 border-[#0a0a1a]"></span>
              </button>
          </div>
      </header>

      <div className="bg-gradient-to-r from-[#1e1e3f] via-[#2d2d5f] to-[#1e1e3f] p-12 rounded-[2.5rem] shadow-xl shadow-indigo-900/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
              <div>
                <h1 className="text-4xl font-black text-white mb-3 tracking-tightest uppercase italic">Hello, {fullName}!</h1>
                <p className="text-indigo-200 text-lg font-medium opacity-80 italic">{bio}</p>
              </div>
              {isOwner && (
                <button 
                    onClick={() => navigate(`/${username}/settings`)}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white backdrop-blur-md border border-white/10 transition-all font-bold flex items-center gap-2"
                >
                    <Edit3 size={18} />
                    <span className="text-xs uppercase tracking-widest hidden md:block">Edit Profile</span>
                </button>
              )}
          </div>
          <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      </div>

      {/* Stats and Rankings Grid - Based on Image 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* GitHub Stats Card */}
          <div className="lg:col-span-2 bg-[#111122] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl hover:border-indigo-500/30 transition-all">
              <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-tighter italic">
                      <Github size={22} className="text-white" />
                      GitHub Stats
                  </h3>
                  <div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      <span>Low</span>
                      <div className="flex gap-1">
                          {[1,2,3,4].map(i => <div key={i} className={`h-2.5 w-2.5 rounded-sm ${i===1?'bg-[#0d1117]':'bg-indigo-500/'+(30*i)}`}></div>)}
                      </div>
                      <span>High</span>
                  </div>
              </div>
              <div className="mt-8 overflow-hidden flex justify-center">
                  {student.githubUsername ? (
                      <GitHubCalendar username={student.githubUsername} colorScheme="dark" />
                  ) : (
                      <p className="text-slate-400 text-center w-full py-4 text-sm font-medium italic">GitHub username not configured in settings.</p>
                  )}
              </div>
               <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-8 pt-10 border-t border-white/5 overflow-hidden">
                  {langsLoading ? (
                      <div className="col-span-full text-center text-slate-500 text-xs italic">Analyzing GitHub repositories...</div>
                  ) : githubLangs.length > 0 ? (
                      githubLangs.map(lang => (
                          <SkillTag key={lang.label} label={lang.label} percent={lang.percent} color={lang.color} />
                      ))
                  ) : (
                      <>
                          <SkillTag label="JavaScript" percent={45} color="yellow" />
                          <SkillTag label="Python" percent={30} color="blue" />
                          <SkillTag label="HTML/CSS" percent={25} color="orange" />
                          <SkillTag label="Other" percent={10} color="indigo" />
                      </>
                  )}
              </div>
          </div>

          {/* LeetCode & Coding Platforms Stats - Based on Image 1 */}
          <div className="bg-[#111122] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col justify-between">
              <h3 className="text-lg font-black text-white mb-10 uppercase tracking-tighter border-b border-white/5 pb-4 italic">Coding Profiles</h3>
              
              <div className="space-y-10 flex-1">
                  {/* LeetCode Section */}
                  {student.leetcodeUrl ? (
                  <div className="group cursor-default">
                      <div className="flex items-center justify-between mb-4 text-sm font-bold">
                          <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-400 group-hover:bg-orange-500/20 transition-all">
                                  <Code size={20} />
                              </div>
                              <span className="text-slate-700">LeetCode</span>
                          </div>
                      </div>
                      <a href={student.leetcodeUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-black text-indigo-600 hover:text-indigo-500 ml-1 flex items-center gap-2">
                        View Profile <ExternalLink size={16} />
                      </a>
                  </div>
                  ) : null}

                   {/* Codeforces Section */}
                   {student.codeforcesUrl ? (
                   <div className="group cursor-default pt-6 border-t border-white/5">
                      <div className="flex items-center justify-between mb-4 text-sm font-bold">
                          <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                                  <Activity size={20} />
                              </div>
                              <span className="text-slate-700">Codeforces</span>
                          </div>
                      </div>
                      <a href={student.codeforcesUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-black text-indigo-600 hover:text-indigo-500 ml-1 flex items-center gap-2">
                        View Profile <ExternalLink size={16} />
                      </a>
                  </div>
                  ) : null}
                  
                  {!student.leetcodeUrl && !student.codeforcesUrl && (
                      <div className="text-slate-400 text-sm font-medium italic text-center py-10">
                          Coding profiles not configured. Add them in Settings.
                      </div>
                  )}
              </div>
          </div>
      </div>

      <div className="space-y-8 pt-4">
          <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
                  <Award size={26} className="text-indigo-500" />
                  Project Showcase
              </h3>
              <p className="text-slate-400 text-sm font-medium italic">Handpick your best work to show on your public portfolio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
              {loading ? (
                  <div className="col-span-full text-center py-10 text-slate-400">Loading projects...</div>
              ) : projects.filter(p => p.status === 'featured').length > 0 ? (
                  projects.filter(p => p.status === 'featured').map(p => (
                      <ProjectCard 
                          key={p.id}
                          title={p.title} 
                          desc={p.shortDescription || "No description provided."} 
                          techStack={p.techStack?.split(",") || ["GitHub"]}
                          imageUrl={p.imageUrl}
                      />
                  ))
              ) : (
                  <div className="col-span-full text-center py-10 text-slate-400">No featured projects to show. Use the Projects tab to add or feature a project.</div>
              )}
          </div>
      </div>
    </div>
  );
}

const ProjectCard = ({ title, desc, techStack, imageUrl }) => (
    <motion.div 
        whileHover={{ scale: 1.02, translateY: -5 }}
        className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl hover:border-indigo-500/50 transition-all group cursor-pointer relative overflow-hidden flex flex-col h-full hover:shadow-indigo-500/10"
    >
        {/* Animated Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="absolute top-0 right-0 p-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-300">
            <div className="p-2 bg-indigo-500/20 rounded-xl backdrop-blur-md border border-indigo-500/30">
                <ExternalLink className="text-indigo-400" size={18} />
            </div>
        </div>
        
        {imageUrl ? (
            <div className="h-48 w-full mb-8 rounded-2xl overflow-hidden border border-white/5 bg-slate-950 flex items-center justify-center relative group-hover:border-indigo-500/20 transition-colors">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
        ) : (
            <div className="h-48 w-full mb-8 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-600/5 border border-white/5 flex items-center justify-center group-hover:border-indigo-500/20 transition-colors">
                <Layers className="text-slate-700 group-hover:text-indigo-500/50 transition-colors" size={40} />
            </div>
        )}

        <div className="flex-1">
            <h4 className="text-2xl font-black text-white mb-3 tracking-tighter group-hover:text-indigo-400 transition-colors uppercase italic leading-none">{title}</h4>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 line-clamp-3 italic opacity-80 group-hover:opacity-100 transition-opacity">{desc}</p>
        </div>
        
        <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex flex-wrap gap-2">
                {techStack.map(t => (
                    <span key={t} className="px-3 py-1 text-[9px] font-black rounded-lg bg-white/5 border border-white/5 text-slate-400 uppercase tracking-widest group-hover:border-indigo-500/20 group-hover:text-indigo-300 transition-all">
                        {t.trim()}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/20 transition-all">
                        <Check className="text-indigo-400" size={10} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic group-hover:text-slate-200 transition-colors">Project Live</span>
                </div>
                <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '70%' }}
                        className="h-full bg-indigo-600 rounded-full"
                    ></motion.div>
                </div>
            </div>
        </div>
    </motion.div>
);
