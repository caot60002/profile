import React, { useState, useEffect } from 'react';
import { ServerConfig, Profile } from '../types';
import { createRemoteBin } from '../services/storage';

interface AdminLoginProps {
    onSuccess: () => void;
    onClose: () => void;
    onConfigSave: (config: ServerConfig | null) => void;
    currentProfile: Profile;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onClose, onConfigSave, currentProfile }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // Server Config State
    const [useCloud, setUseCloud] = useState(false);
    const [binId, setBinId] = useState('');
    const [apiKey, setApiKey] = useState('');
    
    // Creation State
    const [isCreating, setIsCreating] = useState(false);
    const [creationMsg, setCreationMsg] = useState('');
    
    const [error, setError] = useState(false);

    useEffect(() => {
        // Load existing config if available
        const savedConfig = localStorage.getItem('guns_lol_server_config');
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            setUseCloud(true);
            setBinId(parsed.binId);
            setApiKey(parsed.apiKey);
        }
    }, []);

    const handleCreateBin = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!apiKey) {
            setCreationMsg("Enter API Key first!");
            return;
        }
        
        setIsCreating(true);
        setCreationMsg("Creating...");
        
        try {
            const newBinId = await createRemoteBin(currentProfile, apiKey);
            setBinId(newBinId);
            setCreationMsg("Success! Bin ID filled.");
        } catch (err: any) {
            setCreationMsg(`Error: ${err.message}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock Credentials
        if (username === 'admin' && password === '123') {
            // Handle Cloud Config Saving
            if (useCloud && binId && apiKey) {
                const config: ServerConfig = { binId, apiKey };
                localStorage.setItem('guns_lol_server_config', JSON.stringify(config));
                onConfigSave(config);
            } else if (!useCloud) {
                localStorage.removeItem('guns_lol_server_config');
                onConfigSave(null);
            }

            onSuccess();
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in overflow-y-auto py-10">
            <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-8 w-full max-w-sm relative shadow-2xl my-auto">
                 <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>

                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-white/5 rounded-full border border-white/5 mb-3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white/70">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <h2 className="text-white font-mono font-bold text-lg tracking-wider">ADMIN ACCESS</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input 
                            type="text" 
                            placeholder="Username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded p-3 text-sm text-white focus:border-white/30 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded p-3 text-sm text-white focus:border-white/30 outline-none transition-colors"
                        />
                    </div>

                    {/* Cloud Sync Section */}
                    <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-white/50 font-mono flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={useCloud} 
                                    onChange={(e) => setUseCloud(e.target.checked)}
                                    className="mr-2"
                                />
                                Enable Cloud Sync (JSONBin)
                            </label>
                            <a href="https://jsonbin.io" target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline">Get Keys</a>
                        </div>
                        
                        {useCloud && (
                            <div className="space-y-3 bg-white/5 p-3 rounded animate-fade-in">
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase font-mono block mb-1">X-Master-Key</label>
                                    <input 
                                        type="password" 
                                        placeholder="$2a$10$..." 
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded p-2 text-xs text-white focus:border-white/30 outline-none"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase font-mono mb-1 flex justify-between">
                                        <span>Bin ID</span>
                                        {!binId && apiKey && (
                                            <button 
                                                onClick={handleCreateBin}
                                                disabled={isCreating}
                                                className="text-[9px] text-blue-400 hover:text-blue-300 underline cursor-pointer disabled:opacity-50"
                                            >
                                                {isCreating ? 'Creating...' : 'Auto-Create New'}
                                            </button>
                                        )}
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter ID or click Auto-Create" 
                                        value={binId}
                                        onChange={(e) => setBinId(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded p-2 text-xs text-white focus:border-white/30 outline-none"
                                    />
                                    {creationMsg && (
                                        <p className={`text-[9px] mt-1 ${creationMsg.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                                            {creationMsg}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs font-mono text-center bg-red-500/10 p-2 rounded border border-red-500/20">
                            ACCESS DENIED
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-white text-black font-bold py-3 rounded text-sm hover:bg-gray-200 transition-colors tracking-wide font-mono"
                    >
                        LOGIN & CONFIGURE
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
