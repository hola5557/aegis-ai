import React, { useState } from 'react';

interface AuthPageProps {
  onLogin: (email: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay for realism
    setTimeout(() => {
        onLogin(email || 'user@aegis.ai');
        setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-aegis-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-aegis-accent/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-aegis-900/80 backdrop-blur-xl border border-aegis-800 rounded-2xl shadow-2xl shadow-black/50 p-8 relative z-10">
        
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-aegis-500 to-aegis-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-aegis-500/20 mb-4">
                <span className="text-3xl text-white">◈</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
                {isLogin ? 'Welcome Back' : 'Initialize Access'}
            </h1>
            <p className="text-aegis-400 text-xs uppercase tracking-widest mt-2 font-mono">
                Aegis Sovereign Intelligence
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Identity (Email)</label>
                <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-aegis-950 border border-aegis-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-aegis-500 focus:ring-1 focus:ring-aegis-500 transition-all placeholder-gray-700"
                    placeholder="operative@aegis.ai"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Secure Key (Password)</label>
                <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-aegis-950 border border-aegis-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-aegis-500 focus:ring-1 focus:ring-aegis-500 transition-all placeholder-gray-700"
                    placeholder="••••••••••••"
                />
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-aegis-500 hover:bg-aegis-400 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-aegis-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Authenticating...
                    </>
                ) : (
                    isLogin ? 'Establish Connection' : 'Create Sovereign ID'
                )}
            </button>
        </form>

        <div className="mt-6 pt-6 border-t border-aegis-800 text-center">
            <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
            >
                {isLogin ? "Need a secure channel? " : "Already have credentials? "}
                <span className="text-aegis-400 font-semibold">{isLogin ? "Sign Up" : "Log In"}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;