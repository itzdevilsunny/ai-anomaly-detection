import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Video, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const [email, setEmail] = useState('admin@visionaiot.com');
    const [password, setPassword] = useState('admin123');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // --- TEMPORARY BYPASS MODE ---
        // Simulating a brief network delay for UX, then logging the user in unconditionally.
        setTimeout(() => {
            const mockUser = {
                id: 'bypass-user-999',
                email: email || 'demo@visionaiot.com',
                role: 'Admin' as const, // Grants access to Security dashboard too
            };

            const mockToken = 'temporary-development-jwt-token';

            // Inject into Zustand store and local storage
            setAuth(mockUser, mockToken);

            // Route to dashboard
            navigate('/dashboard');
        }, 800);
    };

    return (
        <div className="min-h-screen flex bg-[#0B0F19] text-white font-sans">

            {/* Left Column: Branding (Hidden on mobile) */}
            <div className="hidden lg:flex flex-col justify-center w-1/2 p-20 relative overflow-hidden bg-gradient-to-br from-[#0B0F19] to-[#0A101E]">
                {/* Top Logo */}
                <div className="absolute top-10 left-10 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Video size={24} className="text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">VisionAIoT</span>
                </div>

                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                    <h1 className="text-6xl font-extrabold tracking-tight mb-2">Command Core</h1>
                    <h1 className="text-6xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                        Access Gateway
                    </h1>
                    <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                        Secure authentication portal for the city-scale intelligence and anomaly detection infrastructure.
                    </p>
                </motion.div>

                {/* Bottom Security Badge */}
                <div className="absolute bottom-10 left-10 flex items-center gap-2 text-emerald-500/80 text-sm font-medium">
                    <ShieldCheck size={18} />
                    <span>AES-256 Encrypted Connection</span>
                </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#111623] border-l border-gray-800 shadow-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="max-w-md w-full"
                >
                    <h2 className="text-3xl font-bold mb-2">Operator Login</h2>
                    <p className="text-gray-400 mb-8">Enter your credentials to access the command center.</p>

                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0B0F19] border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                    placeholder="admin@visionaiot.com"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                                <a href="#" className="text-xs font-bold text-blue-500 hover:text-blue-400">FORGOT?</a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-500" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0B0F19] border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                        >
                            {isLoading ? 'Authenticating...' : 'Initialize Session'}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>

                    </form>

                    {/* Demo Access Note */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">Demo Access Enabled</p>
                        <p className="text-xs text-gray-600 mt-1">Any credentials will currently grant Admin access.</p>
                    </div>
                </motion.div>
            </div>

        </div>
    );
}
