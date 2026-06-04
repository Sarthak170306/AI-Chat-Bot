import { useAuth, SignIn } from '@clerk/nextjs';
import ChatInterface from '../components/ChatInterface';

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();

  // Show a loading screen while Clerk initializes to prevent layout shifts
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0c10] text-[#e3e3e3] font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#111217] flex items-center justify-center border border-zinc-800 animate-pulse">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 20V4L18 20V4" className="stroke-teal-400" />
              <circle cx="6" cy="4" r="2" className="fill-blue-500 stroke-none" />
              <circle cx="6" cy="20" r="2" className="fill-blue-500 stroke-none" />
              <circle cx="18" cy="4" r="2" className="fill-blue-500 stroke-none" />
              <circle cx="18" cy="20" r="2" className="fill-blue-500 stroke-none" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm font-medium animate-pulse">Loading secure session...</p>
        </div>
      </div>
    );
  }

  // If the user is signed in, render the main chatbot UI
  if (isSignedIn) {
    return <ChatInterface />;
  }

  // If unauthenticated, render the modern login dashboard page
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#0b0c10] text-slate-100 overflow-hidden font-sans">
      {/* Brand Presentation Column (Desktop only) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#111217] via-[#0b0c10] to-[#121c24] flex-col justify-between p-12 relative overflow-hidden border-r border-zinc-900/30">
        {/* Visual ambient glow effect */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
        
        <div className="flex items-center space-x-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-[#1a1b23] border border-zinc-800 flex items-center justify-center shadow-lg">
            <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 20V4L18 20V4" className="stroke-teal-400" />
              <circle cx="6" cy="4" r="2" className="fill-blue-500 stroke-none" />
              <circle cx="6" cy="20" r="2" className="fill-blue-500 stroke-none" />
              <circle cx="18" cy="4" r="2" className="fill-blue-500 stroke-none" />
              <circle cx="18" cy="20" r="2" className="fill-blue-500 stroke-none" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-wider bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">NexAI</span>
        </div>

        <div className="space-y-6 relative z-10">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Connect to the future of <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">interactive intelligence</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Securely sign in to access your chat workspace powered by advanced generative AI integrations.
          </p>
        </div>

        <div className="text-xs text-slate-500 relative z-10">
          © 2026 NexAI. Powered by Next.js & Google Generative AI SDK.
        </div>
      </div>

      {/* SignIn Interface Column */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#0b0c10] relative">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        
        <div className="relative z-10 flex flex-col items-center w-full max-w-md space-y-6">
          {/* Brand logo for mobile viewports */}
          <div className="flex items-center space-x-2.5 md:hidden mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#111217] border border-zinc-800 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 20V4L18 20V4" className="stroke-teal-400" />
                <circle cx="6" cy="4" r="2" className="fill-blue-500 stroke-none" />
                <circle cx="6" cy="20" r="2" className="fill-blue-500 stroke-none" />
                <circle cx="18" cy="4" r="2" className="fill-blue-500 stroke-none" />
                <circle cx="18" cy="20" r="2" className="fill-blue-500 stroke-none" />
              </svg>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">NexAI</span>
          </div>

          {/* Clerk Sign In component */}
          <div className="shadow-2xl rounded-2xl overflow-hidden border border-slate-800 bg-[#111217]/50 backdrop-blur-xl">
            <SignIn routing="hash" />
          </div>
        </div>
      </div>
    </main>
  );
}
