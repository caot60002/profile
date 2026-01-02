import React, { useState } from 'react';
import { Profile, SocialLink, GenerationTone } from '../types';
import { Icon } from './Icons';
import { generateAestheticBio } from '../services/geminiService';

interface EditorProps {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  isOpen: boolean;
  onClose: () => void;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}

const Editor: React.FC<EditorProps> = ({ profile, setProfile, isOpen, onClose, saveStatus = 'idle' }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'links' | 'ai'>('general');
  
  // AI State
  const [keywords, setKeywords] = useState('');
  const [aiTone, setAiTone] = useState<GenerationTone>(GenerationTone.EDGY);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Smart Fix: Auto-convert GitHub blob links to raw links for images
    // Ex: https://github.com/user/repo/blob/main/img.gif -> https://raw.githubusercontent.com/user/repo/main/img.gif
    if ((name === 'backgroundUrl' || name === 'avatarUrl' || name === 'musicUrl') && value.includes('github.com') && value.includes('/blob/')) {
        finalValue = value.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }

    setProfile(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleGenerateBio = async () => {
    if (!keywords.trim()) return;
    setIsGenerating(true);
    const newBio = await generateAestheticBio(keywords, aiTone);
    setProfile(prev => ({ ...prev, bio: newBio }));
    setIsGenerating(false);
  };

  const addLink = () => {
      const newLink: SocialLink = {
          id: Date.now().toString(),
          platform: 'discord',
          url: '#'
      };
      setProfile(prev => ({...prev, links: [...prev.links, newLink]}));
  };

  const removeLink = (id: string) => {
      setProfile(prev => ({...prev, links: prev.links.filter(l => l.id !== id)}));
  };

  const updateLink = (id: string, field: keyof SocialLink, value: string) => {
      setProfile(prev => ({
          ...prev,
          links: prev.links.map(l => l.id === id ? { ...l, [field]: value } : l)
      }));
  };

  return (
    <div className={`fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-[#0f0f0f] border-l border-white/10 z-50 transform transition-transform duration-300 overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-[#0f0f0f] z-10">
            <div className="flex flex-col">
                <h2 className="text-white font-mono font-bold">PAGE EDITOR</h2>
                <div className="h-4">
                    {saveStatus === 'saving' && <span className="text-[10px] text-yellow-500 font-mono animate-pulse">SAVING...</span>}
                    {saveStatus === 'saved' && <span className="text-[10px] text-green-500 font-mono">ALL CHANGES SAVED</span>}
                    {saveStatus === 'error' && <span className="text-[10px] text-red-500 font-mono">SAVE FAILED (CHECK SIZE)</span>}
                </div>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
            <button 
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider ${activeTab === 'general' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
            >
                General
            </button>
             <button 
                onClick={() => setActiveTab('links')}
                className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider ${activeTab === 'links' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
            >
                Links
            </button>
            <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider ${activeTab === 'ai' ? 'bg-purple-900/30 text-purple-300' : 'text-purple-500/40 hover:text-purple-400'}`}
            >
                AI Magic
            </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            {activeTab === 'general' && (
                <>
                    <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase font-mono">Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            value={profile.username} 
                            onChange={handleInputChange}
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-white/40 outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase font-mono">Tagline</label>
                        <input 
                            type="text" 
                            name="tagline" 
                            value={profile.tagline} 
                            onChange={handleInputChange}
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-white/40 outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase font-mono">Avatar URL</label>
                        <input 
                            type="text" 
                            name="avatarUrl" 
                            value={profile.avatarUrl} 
                            onChange={handleInputChange}
                            placeholder="Supports Images & Videos (GitHub Raw)"
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-xs text-white focus:border-white/40 outline-none"
                        />
                        <p className="text-[10px] text-white/30">Paste any GitHub image/video link, we'll fix it.</p>
                    </div>
                     <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase font-mono">Background URL</label>
                        <input 
                            type="text" 
                            name="backgroundUrl" 
                            value={profile.backgroundUrl} 
                            onChange={handleInputChange}
                            placeholder="Supports Images & Videos (GitHub Raw)"
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-xs text-white focus:border-white/40 outline-none"
                        />
                        <p className="text-[10px] text-white/30">Paste any GitHub image/video link, we'll fix it.</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase font-mono">Music URL</label>
                        <input 
                            type="text" 
                            name="musicUrl" 
                            value={profile.musicUrl || ''} 
                            onChange={handleInputChange}
                            placeholder="YouTube link or MP3/Audio URL"
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-xs text-white focus:border-white/40 outline-none"
                        />
                        <p className="text-[10px] text-white/30">Auto-plays on enter.</p>
                    </div>
                     <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase font-mono">Accent Color</label>
                        <div className="flex items-center space-x-2">
                             <input 
                                type="color" 
                                name="accentColor" 
                                value={profile.accentColor} 
                                onChange={handleInputChange}
                                className="h-8 w-8 bg-transparent border-0 cursor-pointer"
                            />
                            <span className="text-white/50 text-xs font-mono">{profile.accentColor}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase font-mono">Bio</label>
                        <textarea 
                            name="bio" 
                            value={profile.bio} 
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-white/40 outline-none resize-none"
                        />
                    </div>
                </>
            )}

            {activeTab === 'links' && (
                <div className="space-y-4">
                    {profile.links.map((link) => (
                        <div key={link.id} className="bg-white/5 p-3 rounded border border-white/5 flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                                <select 
                                    value={link.platform}
                                    onChange={(e) => updateLink(link.id, 'platform', e.target.value)}
                                    className="bg-black text-white text-xs border border-white/10 rounded p-1 outline-none"
                                >
                                    <option value="discord">Discord</option>
                                    <option value="twitter">Twitter</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="youtube">YouTube</option>
                                    <option value="twitch">Twitch</option>
                                    <option value="github">GitHub</option>
                                    <option value="telegram">Telegram</option>
                                </select>
                                <button onClick={() => removeLink(link.id)} className="text-red-500 hover:text-red-400">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            <input 
                                type="text" 
                                placeholder="URL" 
                                value={link.url}
                                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded p-1 text-xs text-white"
                            />
                        </div>
                    ))}
                    <button 
                        onClick={addLink}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded text-sm font-mono border border-white/5 transition-colors"
                    >
                        + ADD LINK
                    </button>
                </div>
            )}

            {activeTab === 'ai' && (
                <div className="space-y-6">
                    <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-lg">
                        <h3 className="text-purple-300 font-bold mb-2 flex items-center">
                            <Icon name="wand" className="w-4 h-4 mr-2" /> AI Bio Generator
                        </h3>
                        <p className="text-purple-200/60 text-xs mb-4">
                            Stuck on what to write? Let Gemini generate an aesthetic bio for you.
                        </p>
                        
                        <div className="space-y-3">
                             <div className="space-y-1">
                                <label className="text-xs text-white/40 uppercase font-mono">Keywords (e.g. gamer, sad, coding)</label>
                                <input 
                                    type="text" 
                                    value={keywords} 
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="dark, mysterious, developer..."
                                    className="w-full bg-black/50 border border-purple-500/30 rounded p-2 text-white focus:border-purple-500/60 outline-none placeholder-white/20"
                                />
                            </div>
                             <div className="space-y-1">
                                <label className="text-xs text-white/40 uppercase font-mono">Tone</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.values(GenerationTone).map((tone) => (
                                        <button
                                            key={tone}
                                            onClick={() => setAiTone(tone)}
                                            className={`text-xs border rounded py-1 capitalize transition-colors ${aiTone === tone ? 'bg-purple-600 border-purple-600 text-white' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                                        >
                                            {tone}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button 
                                onClick={handleGenerateBio}
                                disabled={isGenerating || !keywords.trim()}
                                className={`w-full py-2 rounded text-sm font-bold flex items-center justify-center ${isGenerating ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
                            >
                                {isGenerating ? 'GENERATING...' : 'GENERATE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Editor;
