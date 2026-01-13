import React, { useState } from 'react';

interface AuthPageProps {
  onLogin: (email: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    simulateLogin(email || 'user@aegis.ai');
  };

  const openGoogleLogin = () => {
    setShowGoogleModal(true);
  };

  const handleGoogleAccountSelect = (email: string) => {
    setShowGoogleModal(false);
    simulateLogin(email);
  };

  const simulateLogin = (targetEmail: string) => {
    setIsLoading(true);
    // Simulate network delay for realism
    setTimeout(() => {
        onLogin(targetEmail);
        setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-aegis-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-aegis-accent/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
      </div>

      <div className="w-full max-w-md bg-aegis-900/60 backdrop-blur-xl border border-aegis-800 rounded-3xl shadow-2xl shadow-black/50 p-8 relative z-10">
        
        <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto flex items-center justify-center mb-4 text-aegis-500">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                    <path d="M12 2L3 7V12C3 17.5228 6.75736 22.2573 12 23.5C17.2426 22.2573 21 17.5228 21 12V7L12 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                {isLogin ? 'Welcome Back' : 'Join Aegis AI'}
            </h1>
            <p className="text-gray-400 text-sm">
                Secure, Sovereign, Intelligent.
            </p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
            <button 
                type="button"
                disabled={isLoading}
                onClick={openGoogleLogin}
                className="w-full bg-white text-gray-900 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
            </button>
        </div>

        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-aegis-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0b101e] px-2 text-gray-500 rounded">Or use email</span>
            </div>
        </div>

        <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
                <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-aegis-950/50 border border-aegis-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-aegis-500 focus:ring-1 focus:ring-aegis-500 transition-all placeholder-gray-600"
                    placeholder="name@company.com"
                />
            </div>

            <div>
                <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-aegis-950/50 border border-aegis-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-aegis-500 focus:ring-1 focus:ring-aegis-500 transition-all placeholder-gray-600"
                    placeholder="Password"
                />
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-aegis-600 hover:bg-aegis-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-aegis-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                    </>
                ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                )}
            </button>
        </form>

        <div className="mt-6 pt-6 border-t border-aegis-800 text-center">
            <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
            >
                {isLogin ? "No account? " : "Already have an account? "}
                <span className="text-aegis-400 font-medium hover:underline">{isLogin ? "Sign up" : "Log in"}</span>
            </button>
        </div>
      </div>

      {/* Mock Google Account Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowGoogleModal(false)}>
            <div className="bg-white text-gray-900 w-full max-w-sm rounded-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 pb-2">
                    <div className="flex justify-center mb-4">
                        <svg className="w-10 h-10" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    </div>
                    <h3 className="text-center text-xl font-medium mb-1">Choose an account</h3>
                    <p className="text-center text-sm text-gray-500 mb-6">to continue to Aegis AI</p>
                    
                    <ul className="space-y-1">
                        <li 
                            onClick={() => handleGoogleAccountSelect('alice.adams@gmail.com')}
                            className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"
                        >
                            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm">A</div>
                            <div>
                                <div className="font-medium text-sm">Alice Adams</div>
                                <div className="text-xs text-gray-500">alice.adams@gmail.com</div>
                            </div>
                        </li>
                        <li 
                            onClick={() => handleGoogleAccountSelect('bob.builder@gmail.com')}
                            className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100"
                        >
                            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">B</div>
                            <div>
                                <div className="font-medium text-sm">Bob Builder</div>
                                <div className="text-xs text-gray-500">bob.builder@gmail.com</div>
                            </div>
                        </li>
                        <li 
                            className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded cursor-pointer"
                        >
                             <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                             </div>
                             <div className="font-medium text-sm text-gray-700">Use another account</div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
