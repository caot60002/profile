import React, { useRef, useState, useEffect } from 'react';
import { Profile } from '../types';
import { Icon } from './Icons';
import Typewriter from './Typewriter';

interface ProfileCardProps {
  profile: Profile;
  isMuted: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, isMuted }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  // Real view count state
  const [realViews, setRealViews] = useState<string | null>(null);

  // Helper to check if avatar is a video
  const isVideo = (url: string) => {
      return /\.(mp4|webm|ogg|mov)($|\?)/i.test(url);
  };

  // Helper to extract YouTube Video ID
  const getYouTubeId = (url: string | undefined) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(profile.musicUrl);

  // Effect for View Count Simulation (Real-feel check)
  useEffect(() => {
    const fetchRealViews = async () => {
        setRealViews(null); // Reset to loading state if profile changes
        
        // 1. Simulate Network Latency (Make it look like a real API check)
        // Random delay between 600ms and 1500ms
        const delay = Math.floor(Math.random() * 900) + 600; 
        await new Promise(resolve => setTimeout(resolve, delay));

        // 2. Logic for "Real" Views
        // Since we don't have a backend DB, we use LocalStorage to make it persistent per user.
        // In a real production app, this would be: await api.getViews(profile.username);
        const storageKey = `gl_views_${profile.username}`;
        const storedViews = localStorage.getItem(storageKey);
        
        // If first time visiting this user, use the base views from profile, else use stored
        let currentCount = storedViews ? parseInt(storedViews) : profile.views;
        
        // Increment the view (Real hit counter behavior)
        currentCount++;
        
        // Save back to storage
        localStorage.setItem(storageKey, currentCount.toString());
        
        // Update UI
        setRealViews(currentCount.toLocaleString());
    };

    fetchRealViews();
  }, [profile.username, profile.views]);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Calculate normalized position (-1 to 1)
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      
      // Max rotation in degrees
      const maxTilt = 4; // Reduced tilt for a more solid, premium feel
      
      // Calculate rotation to "look at" the cursor
      const rotateY = x * maxTilt;
      const rotateX = y * maxTilt; 

      setRotation({ x: rotateX, y: rotateY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
        className="relative w-full max-w-[420px] mx-auto p-4 z-10"
        style={{ perspective: '1200px' }}
    >
        {/* ACTUAL MUSIC PLAYERS (HIDDEN) */}
        {profile.musicUrl && !isMuted && (
            <div className="hidden">
                {youtubeId ? (
                    // YouTube Embed
                    <iframe 
                        width="100%" 
                        height="100" 
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&mute=0`} 
                        title="Background Music"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    // Standard Audio (MP3, WAV, etc)
                    <audio 
                        src={profile.musicUrl} 
                        autoPlay 
                        loop 
                    />
                )}
            </div>
        )}

      {/* Glassmorphism Card with Tilt */}
      <div 
        ref={cardRef}
        className="relative bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/5 rounded-2xl p-8 shadow-2xl overflow-hidden transition-transform duration-100 ease-out will-change-transform"
        style={{
          boxShadow: `0 0 30px -10px ${profile.accentColor}30, 0 0 0 1px rgba(255,255,255,0.03)`,
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(0)`, 
          backfaceVisibility: 'hidden', 
        }}
      >
        {/* Top Gradient Mesh */}
        <div 
            className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none"
            style={{ backgroundColor: profile.accentColor }}
        />
        <div 
            className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-10 pointer-events-none"
            style={{ backgroundColor: profile.accentColor }}
        />

        {/* Avatar Section */}
        <div className="flex justify-center mb-6 relative">
          <div className="relative group">
            {/* Glow effect behind avatar - tighter and sharper */}
            <div 
                className="absolute inset-0 rounded-full blur-md opacity-30 group-hover:opacity-50 transition duration-500"
                style={{ backgroundColor: profile.accentColor }}
            ></div>
            
            {/* Conditional Rendering: Video or Image */}
            {isVideo(profile.avatarUrl) ? (
                <video 
                    src={profile.avatarUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="relative w-24 h-24 rounded-full object-cover border border-white/10 shadow-lg pointer-events-none bg-black"
                />
            ) : (
                <img 
                    src={profile.avatarUrl} 
                    alt={profile.username} 
                    className="relative w-24 h-24 rounded-full object-cover border border-white/10 shadow-lg pointer-events-none"
                />
            )}
            
             {profile.verified && (
                <div className="absolute -bottom-1 -right-1 text-white bg-black rounded-full p-0.5 border border-black shadow-sm" title="Verified">
                    <Icon name="verified" className="w-5 h-5 text-blue-400" />
                </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="text-center mb-8 space-y-1">
            <div className="min-h-[32px] flex items-center justify-center">
                <h1 
                    className="text-2xl font-bold text-white tracking-tight drop-shadow-sm break-words w-full"
                    style={{ textShadow: `0 0 20px ${profile.accentColor}60` }}
                >
                    <Typewriter text={profile.username} speed={100} delay={200} />
                </h1>
            </div>
            
            <div className="min-h-[20px] flex items-center justify-center pb-2">
                <p className="text-xs text-white/50 font-mono tracking-wider uppercase break-words w-full">
                    <Typewriter text={profile.tagline} speed={50} delay={1200} />
                </p>
            </div>
            
            {/* Typewriter style bio - More "terminal" looking */}
            <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5 relative overflow-hidden group min-h-[4rem] flex items-center justify-center backdrop-blur-sm">
                <p className="text-gray-300 text-xs leading-relaxed font-mono w-full break-words">
                   <Typewriter text={profile.bio} speed={30} delay={2000} />
                </p>
            </div>
        </div>

        {/* Stats / Badges - The "Guns.lol" look */}
        {profile.showBadges && (
            <div className="flex justify-center items-center gap-3 mb-8 text-[10px] text-white/40 font-mono uppercase tracking-widest">
                {/* UID Badge */}
                <div className="flex items-center space-x-1.5 bg-white/[0.03] px-3 py-1.5 rounded border border-white/5 hover:bg-white/[0.06] transition-colors cursor-help" title="User ID">
                    <span className="text-white/30">UID</span>
                    <span className="text-white/80 font-bold">1337</span>
                </div>

                {/* View Count Badge */}
                <div className="flex items-center space-x-1.5 bg-white/[0.03] px-3 py-1.5 rounded border border-white/5 hover:bg-white/[0.06] transition-colors min-w-[70px] justify-center">
                    <Icon name="eye" className="w-3 h-3 text-white/40" />
                    {realViews ? (
                        <span className="text-white/80 font-bold">{realViews}</span>
                    ) : (
                        <div title="Verifying...">
                            <Icon name="loader" className="w-3 h-3 text-white/40" />
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Social Links - Darker, flatter */}
        <div className="space-y-2.5">
          {profile.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-xl transition-all duration-300 group"
              onMouseDown={(e) => e.stopPropagation()} 
            >
                <div className="flex items-center space-x-3">
                    <div className="text-white/60 group-hover:text-white transition-colors duration-300">
                        <Icon name={link.platform} className="w-4 h-4" />
                    </div>
                    <span className="text-white/70 font-medium text-xs capitalize group-hover:translate-x-1 transition-transform duration-300 font-mono">
                        {link.platform}
                    </span>
                </div>
                <div className="text-white/10 group-hover:text-white/40 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </div>
            </a>
          ))}
        </div>

        {/* Footer info inside card if needed, currently clean */}
      </div>
    </div>
  );
};

export default ProfileCard;