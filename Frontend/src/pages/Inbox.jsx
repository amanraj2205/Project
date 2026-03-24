import React, { useState, useEffect } from 'react';
import { Mail, Clock, User, ArrowLeft, Archive, Star, Search, RefreshCw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../lib/axios';

export function Inbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await API.get('/contacts');
      // Assume response.data.data is the array of messages
      setMessages(response.data.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(m => 
    m.senderName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.senderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-8 animate-count overflow-hidden pb-8">
      
      {/* Messages List (Left Sidebar inside Inbox) */}
      <div className={`w-full md:w-1/3 flex flex-col bg-[#111122] rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-8 pb-6 border-b border-white/5 bg-[#1e1e3f]/50 backdrop-blur-sm z-10 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
              <Mail className="text-indigo-400" />
              Inquiries
            </h2>
            <button onClick={fetchMessages} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <input 
                type="text" 
                placeholder="Search messages..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0a1a] border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600 font-medium italic"
             />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 relative z-10">
          {loading ? (
             <div className="flex items-center justify-center p-10 text-slate-500">
               <RefreshCw size={24} className="animate-spin" />
             </div>
          ) : filteredMessages.length > 0 ? (
            filteredMessages.map(msg => (
              <div 
                key={msg.id} 
                onClick={() => setSelectedMessage(msg)}
                className={`p-5 rounded-3xl cursor-pointer transition-all border ${
                  selectedMessage?.id === msg.id 
                    ? 'bg-indigo-600/10 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
                    : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                   <h4 className={`font-black uppercase tracking-tight truncate flex-1 pr-4 ${selectedMessage?.id === msg.id ? 'text-indigo-400' : 'text-slate-200'}`}>
                     {msg.senderName}
                   </h4>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                     {new Date(msg.createdAt).toLocaleDateString()}
                   </span>
                </div>
                <p className="text-xs text-slate-500 font-medium italic truncate mb-3">
                  {msg.senderEmail}
                </p>
                <p className="text-sm text-slate-400 leading-relaxed truncate">
                  {msg.message}
                </p>
              </div>
            ))
          ) : (
             <div className="text-center p-10 mt-10">
               <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                 <Mail size={24} />
               </div>
               <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No Messages Found</p>
             </div>
          )}
        </div>
      </div>

      {/* Message Reader (Right Content) */}
      <div className={`flex-1 flex flex-col bg-[#111122] rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden ${!selectedMessage ? 'hidden md:flex' : 'flex'}`}>
        {selectedMessage ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            key={selectedMessage.id}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-[#1e1e3f]/30 flex justify-between items-start">
               <div>
                  <button onClick={() => setSelectedMessage(null)} className="md:hidden flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs mb-6 hover:text-indigo-300">
                    <ArrowLeft size={16} /> Back to Inbox
                  </button>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">{selectedMessage.senderName}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium italic">
                    <Mail size={14} className="text-indigo-400" />
                    <a href={`mailto:${selectedMessage.senderEmail}`} className="hover:text-indigo-400 transition-colors">
                      {selectedMessage.senderEmail}
                    </a>
                  </div>
               </div>
               <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 px-4 py-2 rounded-full border border-white/5">
                    <Clock size={12} />
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                 </div>
               </div>
            </div>
            
            {/* Body */}
            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedMessage.message}
                </p>
              </div>
            </div>

            {/* Actions */}
             <div className="p-8 border-t border-white/5 bg-[#0a0a1a]/50">
               <a 
                 href={`mailto:${selectedMessage.senderEmail}?subject=Reply to your inquiry on my Portfolio`}
                 className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all"
               >
                 <Mail size={16} /> Reply via Email
               </a>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-60">
             <div className="w-32 h-32 bg-slate-900 rounded-[3rem] rotate-12 flex items-center justify-center text-slate-700 mb-8 border border-white/5 shadow-2xl">
               <Mail size={48} className="-rotate-12" />
             </div>
             <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Select a Message</h3>
             <p className="text-slate-400 font-medium italic max-w-sm">
               Read and respond to inquiries from recruiters, collaborators, or peers who visited your public portfolio.
             </p>
          </div>
        )}
      </div>

    </div>
  );
}
