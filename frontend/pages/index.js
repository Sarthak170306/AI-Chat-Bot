import Link from 'next/link';
import { Mic } from 'lucide-react';
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
    <main className="min-h-screen bg-[#0b0c10] text-[#e3e3e3] flex items-center justify-center relative p-6 overflow-hidden font-sans">
      {/* Background radial glow gradient matching the NexAI branding */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/10 via-teal-500/10 to-transparent blur-[140px] pointer-events-none" />

      {/* Hero card container */}
      <div className="relative z-10 w-full max-w-xl p-8 sm:p-12 rounded-3xl bg-[#111217]/65 backdrop-blur-2xl border border-slate-800/80 shadow-2xl flex flex-col items-center text-center space-y-8">
        
        {/* Micro-animated microphone icon wrapper */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/10 to-blue-500/10 border border-teal-500/20 flex items-center justify-center shadow-lg relative group">
          <div className="absolute inset-0 bg-teal-400/5 rounded-2xl blur-md group-hover:scale-110 transition-all duration-300" />
          <Mic className="w-9 h-9 text-teal-400 group-hover:scale-105 transition-all duration-200" />
        </div>

        {/* Gradient headings */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            AI Voice Transcriber
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            Convert voice recordings and files into high-accuracy text in real-time, powered by deep learning AI models.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4 w-full">
          <Link href="/sign-in" passHref legacyBehavior>
            <a className="inline-flex items-center justify-center px-8 py-4 w-full sm:w-auto min-w-[200px] font-semibold text-white rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 active:scale-[0.98] transition-all duration-200 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-500/30">
              Get Started
            </a>
          </Link>
        </div>
      </div>
    </main>
  );
}
