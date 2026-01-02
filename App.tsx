import React, { useState, useEffect } from 'react';
import EnterScreen from './components/EnterScreen';
import ProfileCard from './components/ProfileCard';
import Editor from './components/Editor';
import AdminLogin from './components/AdminLogin';
import CursorTrail from './components/CursorTrail';
import { Profile, ServerConfig } from './types';
import { Icon } from './components/Icons';
import { saveProfileRemote, loadProfileRemote } from './services/storage';
import { PUBLIC_BIN_ID, PUBLIC_API_KEY } from './config';

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
  
  // Determine Server Config (Priority: Local Admin > URL Params > Static Config)
  const [serverConfig, setServerConfig] = useState<ServerConfig | null>(() => {
      try {
          // 1. Check LocalStorage (Admin login)
          const stored = localStorage.getItem('guns_lol_server_config');
          if (stored) return JSON.parse(stored);

          // 2. Check URL Parameters (Share links)
          const params = new URLSearchParams(window.location.search);
          const urlId = params.get('id');
          const urlKey = params.get('key');
          if (urlId && urlKey) return { binId: urlId, apiKey: urlKey };

          // 3. Check Static Config (config.ts)
          if (PUBLIC_BIN_ID && PUBLIC_API_KEY) {
              return { binId: PUBLIC_BIN_ID, apiKey: PUBLIC_API_KEY };
          }
      } catch {
          return null;
      }
      return null;
  });

  // Initialize profile (Priority: LocalStorage backup > Default)
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem('guns_lol_clone_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch (e) {
      return DEFAULT_PROFILE;
    }
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load from Remote Server on Mount
  useEffect(() => {
    if (serverConfig) {
        // If we are loading from public config/url, show a loading indicator somewhere if needed
        // but for now we just load silently and update
        loadProfileRemote(serverConfig).then((remoteProfile) => {
            if (remoteProfile) {
                setProfile(remoteProfile);
                // Also update local backup so next load is faster/smoother
                try {
                    localStorage.setItem('guns_lol_clone_profile', JSON.stringify(remoteProfile));
                } catch {}
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
  
  // Handle Manual Save
  const handleManualSave = async () => {
      setSaveStatus('saving');
      
      try {
          // 1. Save to Local Storage
          localStorage.setItem('guns_lol_clone_profile', JSON.stringify(profile));
          
          // 2. Save to Remote Server (if configured)
          if (serverConfig) {
              await saveProfileRemote(profile, serverConfig);
              setSaveStatus('saved');
          } else {
              // Just local save
              setSaveStatus('saved');
              alert("Saved LOCALLY only. To save to cloud, please configure Admin > Cloud Sync.");
          }
          
          setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e: any) {
          console.error("Save failed:", e);
          setSaveStatus('error');
          alert(`Save failed: ${e.message}`);
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
      if (config) {
          alert("Connected! Loading cloud profile...");
          // Reload page to force clean state sync or just let useEffect trigger
          // Let's manually trigger a load to be safe without reload
           loadProfileRemote(config).then((remoteProfile) => {
            if (remoteProfile) setProfile(remoteProfile);
        });
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
            key={profile.backgroundUrl}
            src={profile.backgroundUrl}
            autoPlay
            loop
            muted
            playsInline
            className={`fixed inset-0 z-0 w-full h-full object-cover transition-all duration-1000 ${entered && !isEditorOpen ? 'scale-[1.02]' : 'scale-100'}`}
            style={{ 
                filter: entered ? 'brightness(0.5) blur(3px)' : 'brightness(0.3) blur(0px)'
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
            <div className="absolute inset-0 bg-[#0f0f0f] -z-10"></div>
        </div>
      )}

      {/* Overlay Gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none"></div>
      
      {/* Scanlines */}
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

      <EnterScreen onEnter={handleEnter} />

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
        // Pass server config so Editor can show deployment info
        serverConfig={serverConfig}
      />

      {showVolumeHint && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white/50 text-xs px-3 py-1 rounded-full border border-white/5 backdrop-blur font-mono animate-fade-in-out">
              {isMuted ? '🔇 Music Muted' : '🔊 Music Playing'}
          </div>
      )}

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
