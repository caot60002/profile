import React, { useState, useEffect } from 'react';
import EnterScreen from './components/EnterScreen';
import ProfileCard from './components/ProfileCard';
import Editor from './components/Editor';
import AdminLogin from './components/AdminLogin';
import CursorTrail from './components/CursorTrail';
import { Profile, ServerConfig } from './types';
import { Icon } from './components/Icons';
import { saveProfileRemote, loadProfileRemote } from './services/storage';

// Default Profile Data
const DEFAULT_PROFILE: Profile = {
  username: "ghost_user",
  tagline: "digital wanderer",
  bio: "lost in the noise // 404 not found",
  avatarUrl: "https://picsum.photos/200/200", // Placeholder
  backgroundUrl: "https://i.pinimg.com/originals/2b/2b/32/2b2b3236319888874136611388887777.gif", // Dark aesthetic gif placeholder
  accentColor: "#a855f7", // Purple
  links: [
    { id: '1', platform: 'discord', url: 'https://discord.com' },
    { id: '2', platform: 'twitter', url: 'https://twitter.com' },
    { id: '3', platform: 'github', url: 'https://github.com' }
  ],
  showBadges: true,
  views: 1337,
  verified: true,
  musicUrl: 'enabled'
};

const App: React.FC = () => {
  const [entered, setEntered] = useState(false);
  
  // Server Configuration
  const [serverConfig, setServerConfig] = useState<ServerConfig | null>(() => {
      try {
          const stored = localStorage.getItem('guns_lol_server_config');
          return stored ? JSON.parse(stored) : null;
      } catch {
          return null;
      }
  });

  // Initialize from localStorage (Immediate load)
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem('guns_lol_clone_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch (e) {
      console.error("Failed to load profile from localStorage:", e);
      return DEFAULT_PROFILE;
    }
  });

  // Saving Status State
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load from Remote Server on Mount (if config exists)
  useEffect(() => {
    if (serverConfig) {
        setSaveStatus('saving'); // Re-purpose saving indicator as loading
        loadProfileRemote(serverConfig).then((remoteProfile) => {
            if (remoteProfile) {
                setProfile(remoteProfile);
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            } else {
                setSaveStatus('error');
            }
        });
    }
  }, [serverConfig]);

  // Music Mute State
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('guns_lol_clone_muted') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showVolumeHint, setShowVolumeHint] = useState(false);
  
  // Local Storage Sync (Backup)
  // We still save to local storage as a cache/backup
  useEffect(() => {
    try {
        localStorage.setItem('guns_lol_clone_profile', JSON.stringify(profile));
    } catch (e) {
        // Ignore quota errors for backup
    }
  }, [profile]);

  // Handle Manual Save (This is the Main Save Action now)
  const handleManualSave = async () => {
      setSaveStatus('saving');
      
      try {
          // 1. Save to Local Storage
          localStorage.setItem('guns_lol_clone_profile', JSON.stringify(profile));
          
          // 2. Save to Remote Server (if configured)
          if (serverConfig) {
              await saveProfileRemote(profile, serverConfig);
          } else {
              // Simulate small delay if only local so it feels like it did something
              await new Promise(r => setTimeout(r, 500));
          }

          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e: any) {
          console.error("Save failed:", e);
          setSaveStatus('error');
          if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
              alert("Storage Full! Your images are too large. Use JSONBin for unlimited storage.");
          } else {
              alert(`Save failed: ${e.message || 'Check connection or API Keys'}`);
          }
      }
  };

  // Persist muted state
  useEffect(() => {
    try {
      localStorage.setItem('guns_lol_clone_muted', String(isMuted));
    } catch (e) {
      console.error("Failed to save muted state:", e);
    }
  }, [isMuted]);

  const handleEnter = () => {
    setEntered(true);
    // Simulate music start hint
    setShowVolumeHint(true);
    setTimeout(() => setShowVolumeHint(false), 3000);
  };

  const handleAdminAccess = () => {
      setIsLoginOpen(true);
  };

  const handleLoginSuccess = () => {
      setIsLoginOpen(false);
      setIsEditorOpen(true);
  };

  const handleConfigSave = (config: ServerConfig | null) => {
      setServerConfig(config);
      // Trigger a reload if config was added
      if (config) {
          alert("Cloud configuration saved! Attempting to load profile from server...");
      }
  };

  // Helper to check if url is a video
  const isVideo = (url: string) => {
      return /\.(mp4|webm|ogg|mov)($|\?)/i.test(url);
  };

  return (
    <div className="min-h-screen w-full relative bg-black text-white font-sans overflow-hidden">
      
      {/* Visual Effects */}
      <CursorTrail />

      {/* Dynamic Background (Video or Image) */}
      {isVideo(profile.backgroundUrl) ? (
        <video
            key={profile.backgroundUrl} // Re-render when url changes
            src={profile.backgroundUrl}
            autoPlay
            loop
            muted
            playsInline
            className={`fixed inset-0 z-0 w-full h-full object-cover transition-all duration-1000 ${entered && !isEditorOpen ? 'scale-[1.02]' : 'scale-100'}`}
            style={{ 
                filter: entered ? 'brightness(0.5) blur(3px)' : 'brightness(0.3) blur(0px)' // Slightly darker for video to make text pop
            }}
        />
      ) : (
        <div 
            className={`fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 ${entered && !isEditorOpen ? 'animate-ken-burns' : ''}`}
            style={{ 
                backgroundImage: `url('${profile.backgroundUrl}')`,
                filter: entered ? 'brightness(0.6) blur(2px)' : 'brightness(0.3) blur(0px)'
            }}
        >
            {/* Fallback color */}
            <div className="absolute inset-0 bg-[#0f0f0f] -z-10"></div>
        </div>
      )}

      {/* Overlay Gradient for readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none"></div>
      
      {/* Scanline Effect Overlay */}
      <div className="scanlines"></div>

      {/* Content */}
      <div className={`relative z-10 min-h-screen flex items-center justify-center transition-all duration-1000 ${entered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        {entered && (
            <ProfileCard 
                profile={profile}
                isMuted={isMuted}
            />
        )}
      </div>

      {/* Enter Screen Overlay */}
      <EnterScreen onEnter={handleEnter} />

      {/* Admin Login Modal */}
      {isLoginOpen && (
          <AdminLogin 
            onSuccess={handleLoginSuccess} 
            onClose={() => setIsLoginOpen(false)} 
            onConfigSave={handleConfigSave}
            currentProfile={profile}
          />
      )}

      {/* Editor Sidebar */}
      <Editor 
        profile={profile} 
        setProfile={setProfile} 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)}
        saveStatus={saveStatus}
        onSave={handleManualSave}
      />

      {/* Volume Hint (Simulated) */}
      {showVolumeHint && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white/50 text-xs px-3 py-1 rounded-full border border-white/5 backdrop-blur font-mono animate-fade-in-out">
              {isMuted ? '🔇 Music Muted' : '🔊 Music Playing'}
          </div>
      )}

      {/* Footer / Branding / Admin Trigger */}
      {entered && !isEditorOpen && (
          <div className="fixed bottom-4 right-4 flex items-center space-x-4 z-50">
               <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white/20 hover:text-white/60 transition-colors"
                  title={isMuted ? "Unmute Music" : "Mute Music"}
               >
                   <Icon name={isMuted ? "volumeMuted" : "volume"} className="w-4 h-4" />
               </button>

               <button 
                  onClick={handleAdminAccess}
                  className="text-white/20 hover:text-white/60 transition-colors"
                  title="Admin Access"
               >
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
               </button>
              <div className="text-[10px] text-white/20 font-mono tracking-widest cursor-default">
                  BUILT WITH TUDEV
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
