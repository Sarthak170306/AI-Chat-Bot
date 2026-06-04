import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useUser, UserButton } from '@clerk/nextjs';
import { Plus, MessageSquare, SendHorizontal, Menu, X, Image, Mic, HelpCircle, Settings } from 'lucide-react';

export default function ChatInterface() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Pre-configured suggestions for the welcome screen state
  const suggestions = [
    { 
      title: "Explain quantum physics simply", 
      subtitle: "Tell me like I am 5", 
      prompt: "Explain quantum physics in extremely simple terms suitable for a 5-year-old child." 
    },
    { 
      title: "Write a JavaScript fetch function", 
      subtitle: "Clean code with error handling", 
      prompt: "Write a clean JavaScript function using async/await to fetch data from an API, complete with try/catch error handling." 
    },
    { 
      title: "Suggest a 3-day itinerary for Tokyo", 
      subtitle: "Food, culture, and sights", 
      prompt: "Suggest a detailed 3-day itinerary for Tokyo focused on culture, street food, and technology hotspots." 
    },
    { 
      title: "Draft a polite follow-up email", 
      subtitle: "Professional check-in", 
      prompt: "Draft a polite and professional follow-up email to my project team asking for feedback on the latest design review." 
    },
  ];

  // Fetch recent chat sessions for the logged-in user
  const fetchUserSessions = async () => {
    try {
      const token = await getToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/chat/sessions`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessions(data.sessions);
      } else {
        console.error('Failed to fetch sessions', data.error);
      }
    } catch (err) {
      console.error('Error fetching sessions', err);
    }
  };

  // Fetch all messages for a given session
  const fetchSessionMessages = async (sessionId) => {
    try {
      const token = await getToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/chat/history/${sessionId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(data.messages);
        setActiveSessionId(sessionId);
      } else {
        console.error('Failed to fetch session messages', data.error);
      }
    } catch (err) {
      console.error('Error fetching session messages', err);
    }
  };

  // Load sessions on component mount
  useEffect(() => {
    fetchUserSessions();
  }, []);

  // Pre-configured suggestions for the welcome screen state

  // Sessions will be fetched from backend and stored in `sessions` state.

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // 1. Append user message to state
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // 2. Fetch clerk session token
      const token = await getToken();

      // 3. Post to backend chat endpoint
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message: userMessage, sessionId: activeSessionId })
        });

      const data = await response.json();

        if (response.ok && data.success) {
          // 4. Append assistant response
          setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
          // If backend created a new session, update state and refresh sessions list
          if (data.sessionId) {
            setActiveSessionId(data.sessionId);
            fetchUserSessions();
          }
        } else {
          throw new Error(data.error || 'Failed to get a response from the server.');
        }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `Error: ${error.message || 'Unable to connect to the backend server. Make sure it is running on port 5000.'}` 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveSessionId(null);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0c10] text-[#e3e3e3] font-sans">
      
      {/* Backdrop overlay layer for mobile viewports */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - NexAI Style */}
      <aside className={`
        bg-[#111217] text-[#e3e3e3] shrink-0 flex flex-col justify-between border-r border-zinc-900/50
        fixed inset-y-0 left-0 z-50 w-64 -translate-x-full transition-transform duration-300 ease-in-out
        md:static md:translate-x-0 md:z-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Top Control Block */}
        <div className="p-4 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <svg className="w-5.5 h-5.5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 20V4L18 20V4" className="stroke-teal-400" />
                <circle cx="6" cy="4" r="2" className="fill-blue-500 stroke-none" />
                <circle cx="6" cy="20" r="2" className="fill-blue-500 stroke-none" />
                <circle cx="18" cy="4" r="2" className="fill-blue-500 stroke-none" />
                <circle cx="18" cy="20" r="2" className="fill-blue-500 stroke-none" />
              </svg>
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">NexAI</span>
            </div>
            {/* Collapse button on Mobile / Desktop toggle */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-[#1a1b23] text-slate-400 hover:text-white transition duration-150 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Action pill */}
          <button
            onClick={handleNewChat}
            className="flex items-center space-x-3 w-fit py-2.5 px-4 bg-[#1a1b23] hover:bg-[#20222e] text-[#e3e3e3] rounded-full font-medium transition duration-200 text-sm border border-zinc-800/80 hover:border-teal-500/20"
          >
            <Plus className="w-4 h-4 text-slate-400" />
            <span>New chat</span>
          </button>
        </div>

        {/* Recents list section */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 mb-3 text-xs font-semibold text-slate-500 tracking-wider">Recent</div>
          {sessions.map((session) => (
            <button
              key={session._id}
              onClick={() => fetchSessionMessages(session._id)}
              className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-full text-left text-[14px] text-slate-400 hover:bg-[#1a1b23] hover:text-slate-200 transition duration-150 group"
            >
              <MessageSquare className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-400" />
              <span className="truncate flex-1 font-medium">{session.title || 'Untitled'}</span>
            </button>
          ))}
        </div>

        {/* User Account / Clerk block at the bottom */}
        <div className="p-4 border-t border-zinc-900 bg-[#111217] space-y-4">
          <div className="flex flex-col space-y-1">
            <button className="flex items-center space-x-3 w-full px-3 py-2 rounded-full text-left text-[13px] text-slate-400 hover:bg-[#1a1b23] hover:text-slate-200 transition">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span className="font-medium">Help</span>
            </button>
            <button className="flex items-center space-x-3 w-full px-3 py-2 rounded-full text-left text-[13px] text-slate-400 hover:bg-[#1a1b23] hover:text-slate-200 transition">
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="font-medium">Settings</span>
            </button>
          </div>
          <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-[#1a1b23]/40 border border-zinc-800/30">
            <UserButton afterSignOutUrl="/" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-white truncate max-w-[120px]">{user?.firstName || 'User Profile'}</span>
              <span className="text-[10px] text-slate-500 font-light">Secure Session</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col h-full bg-[#0b0c10] overflow-hidden relative">
        {/* Sticky Header bar */}
        <header className="sticky top-0 bg-[#0b0c10]/80 backdrop-blur-md flex items-center justify-between px-6 py-4 z-20 border-b border-zinc-900/30">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-full hover:bg-[#1a1b23] text-slate-400 hover:text-white transition duration-150"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">NexAI 2.5 Flash</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            </div>
          </div>
        </header>

        {/* Screen Content Wrapper */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-zinc-800">
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            
            {messages.length === 0 ? (
              /* Centered Welcome State */
              <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[60vh] select-none text-left relative">
                
                {/* Background Ambient Glow Effect */}
                <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-blue-500/10 via-teal-500/10 to-transparent blur-[140px] pointer-events-none" />

                <div className="space-y-3 w-full mb-10 pl-2 relative z-10">
                  <h2 className="text-5xl md:text-6xl bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 text-transparent bg-clip-text font-extrabold w-fit animate-pulse-slow">
                    Hello, {user?.firstName || 'there'}
                  </h2>
                  <h3 className="text-4xl md:text-5xl font-semibold text-[#444746] leading-tight">
                    What can I help with today?
                  </h3>
                </div>

                {/* Suggestions Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full relative z-10">
                  {suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      onClick={() => setInput(sug.prompt)}
                      className="p-5 rounded-2xl bg-[#111217] hover:bg-[#1a1b23] border border-zinc-900 hover:border-teal-500/20 cursor-pointer transition-all duration-200 group flex flex-col justify-between h-28"
                    >
                      <div className="text-slate-200 text-[14px] leading-relaxed font-medium group-hover:text-white">
                        {sug.title}
                      </div>
                      <div className="text-slate-400 text-xs font-light">
                        {sug.subtitle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat Stream List */
              <div className="space-y-8 pb-10">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start max-w-[85%] sm:max-w-[75%] space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                      {/* Avatar Hook */}
                      {msg.role === 'user' ? (
                        user?.imageUrl ? (
                          <img src={user.imageUrl} className="w-8 h-8 rounded-full border border-zinc-800 object-cover mt-1" alt="User" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold mt-1">
                            {user?.firstName?.charAt(0) || 'U'}
                          </div>
                        )
                      ) : (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#111217] flex items-center justify-center border border-zinc-800 shadow-md">
                          <svg className="w-4.5 h-4.5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 20V4L18 20V4" className="stroke-teal-400" />
                            <circle cx="6" cy="4" r="2.5" className="fill-blue-500 stroke-none" />
                            <circle cx="6" cy="20" r="2.5" className="fill-blue-500 stroke-none" />
                            <circle cx="18" cy="4" r="2.5" className="fill-blue-500 stroke-none" />
                            <circle cx="18" cy="20" r="2.5" className="fill-blue-500 stroke-none" />
                          </svg>
                        </div>
                      )}

                      {/* Bubble Text Styling */}
                      <div className={`
                        text-[16px] leading-relaxed whitespace-pre-wrap pt-1
                        ${msg.role === 'user' 
                          ? 'bg-[#111217] text-slate-100 rounded-2xl rounded-tr-none px-5 py-3 shadow-md border border-zinc-805/40' 
                          : 'text-slate-200'
                        }
                      `}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Shimmering Skeleton Thinking State */}
                {isLoading && (
                  <div className="flex justify-start items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#111217] flex items-center justify-center border border-zinc-800 shadow-md">
                      <svg className="w-4.5 h-4.5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 20V4L18 20V4" className="stroke-teal-400" />
                        <circle cx="6" cy="4" r="2.5" className="fill-blue-500 stroke-none" />
                        <circle cx="6" cy="20" r="2.5" className="fill-blue-500 stroke-none" />
                        <circle cx="18" cy="4" r="2.5" className="fill-blue-500 stroke-none" />
                        <circle cx="18" cy="20" r="2.5" className="fill-blue-500 stroke-none" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-3.5 max-w-[70%] pt-2.5">
                      <div className="h-3 bg-[#111217] rounded-full w-full animate-pulse"></div>
                      <div className="h-3 bg-[#111217] rounded-full w-11/12 animate-pulse" style={{ animationDelay: '100ms' }}></div>
                      <div className="h-3 bg-[#111217] rounded-full w-4/5 animate-pulse" style={{ animationDelay: '200ms' }}></div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}

          </div>
        </div>

        {/* Bottom Input Area with transparent gradient overlay */}
        <footer className="bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/95 to-transparent pt-6 pb-6 px-4 z-20">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto">
            <div className="relative rounded-3xl bg-[#111217] pl-6 pr-3 py-3 border border-zinc-805/30 focus-within:border-teal-500/40 focus-within:ring-1 focus-within:ring-teal-500/10 transition-all duration-200 shadow-2xl flex items-center justify-between space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask NexAI..."
                className="bg-transparent border-none text-white outline-none flex-1 text-[16px] placeholder-slate-500 py-1"
                disabled={isLoading}
              />
              
              <div className="flex items-center space-x-2">
                {/* Aesthetic NexAI Actions */}
                <button type="button" className="p-2 rounded-full text-slate-500 hover:text-slate-300 transition duration-150">
                  <Image className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 rounded-full text-slate-500 hover:text-slate-300 transition duration-150">
                  <Mic className="w-5 h-5" />
                </button>
                
                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 disabled:bg-zinc-850 text-slate-900 disabled:text-zinc-600 flex items-center justify-center hover:bg-white active:scale-95 transition-all duration-150"
                >
                  <SendHorizontal className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
            <div className="text-center text-[11px] text-slate-600 mt-3 font-light select-none">
              NexAI can make mistakes. Verify important info.
            </div>
          </form>
        </footer>
      </main>
    </div>
  );
}
