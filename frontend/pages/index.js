import Link from 'next/link';
import { Image, Mic, Shield } from 'lucide-react';
import { getAuth } from '@clerk/nextjs/server';

export async function getServerSideProps(ctx) {
  const { userId } = getAuth(ctx.req);
  if (userId) {
    return {
      redirect: {
        destination: '/chat',
        permanent: false,
      },
    };
  }
  return { props: {} };
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b0c10] text-[#e3e3e3] flex flex-col items-center justify-center relative px-6 py-12 overflow-y-auto overflow-x-hidden font-sans">
      
      {/* Background Premium Radial Glow */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-teal-500/10 via-cyan-500/5 to-transparent blur-[150px] pointer-events-none" />

      {/* Main Wrapper */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center space-y-12">
        
        {/* Glowing NexAI Geometric Logo */}
        <div className="relative group">
          {/* External glow shadow */}
          <div className="absolute inset-0 bg-teal-400/20 rounded-3xl blur-2xl group-hover:scale-110 transition-all duration-500" />
          
          <div className="relative w-24 h-24 rounded-3xl bg-[#111217] border border-zinc-800/80 flex items-center justify-center shadow-2xl transition-all duration-300">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 20V4L18 20V4" className="stroke-teal-400" />
              <circle cx="6" cy="4" r="2" className="fill-cyan-400 stroke-none" />
              <circle cx="6" cy="20" r="2" className="fill-cyan-400 stroke-none" />
              <circle cx="18" cy="4" r="2" className="fill-cyan-400 stroke-none" />
              <circle cx="18" cy="20" r="2" className="fill-cyan-400 stroke-none" />
            </svg>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              NexAI
            </span>{" "}
            <span className="text-[#e3e3e3]">- Your Multimodal Intelligence</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Experience the next generation of AI. Chat, analyze images, and transcribe voice seamlessly in one unified interface.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <Link href="/sign-in" passHref legacyBehavior>
            <a className="inline-flex items-center justify-center px-10 py-4 font-bold text-white rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 active:scale-[0.98] transition-all duration-200 shadow-xl shadow-indigo-600/35 hover:shadow-indigo-500/45 text-[15px] tracking-wide">
              Enter NexAI Chat
            </a>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-10">
          
          {/* Vision AI Card */}
          <div className="p-6 rounded-2xl bg-[#111217]/50 backdrop-blur-xl border border-slate-800/60 hover:border-teal-500/20 transition-all duration-300 text-left space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
              <Image className="w-5 h-5 text-teal-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors duration-200">Vision AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamlessly upload, parse, and analyze image assets using state-of-the-art vision models.
              </p>
            </div>
          </div>

          {/* Voice Intelligence Card */}
          <div className="p-6 rounded-2xl bg-[#111217]/50 backdrop-blur-xl border border-slate-800/60 hover:border-teal-500/20 transition-all duration-300 text-left space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Mic className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors duration-200">Voice Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stream live voice prompts with client-side buffer recordings for high-speed voice inputs.
              </p>
            </div>
          </div>

          {/* Secure Sessions Card */}
          <div className="p-6 rounded-2xl bg-[#111217]/50 backdrop-blur-xl border border-slate-800/60 hover:border-teal-500/20 transition-all duration-300 text-left space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors duration-200">Secure Sessions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Keep dynamic logs isolated and synced safely under multi-session cryptographic datastores.
              </p>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
