import React, { useState } from 'react';

interface AdminLoginProps {
    onSuccess: () => void;
    onClose: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock Credentials
        if (username === 'TuDev' && password === 'ToiLaTu?') {
            onSuccess();
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-8 w-full max-w-sm relative shadow-2xl">
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
                    <p className="text-white/40 text-xs text-center mt-1">Authenticate to edit profile.</p>
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

                    {error && (
                        <div className="text-red-500 text-xs font-mono text-center bg-red-500/10 p-2 rounded border border-red-500/20">
                            ACCESS DENIED
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-white text-black font-bold py-3 rounded text-sm hover:bg-gray-200 transition-colors tracking-wide font-mono"
                    >
                        LOGIN
                    </button>

                    <div className="text-center pt-2">
                        <span className="text-[10px] text-white/20 font-mono">Hint: admin / 123</span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
