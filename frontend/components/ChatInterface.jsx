import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useUser, UserButton, SignOutButton } from '@clerk/nextjs';
import { Plus, MessageSquare, SendHorizontal, Menu, X, Image, Mic, HelpCircle, Settings } from 'lucide-react';

export default function ChatInterface() {
  const { getToken, isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [base64Audio, setBase64Audio] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
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
    if (!isLoaded || !userId) {
      console.log("Clerk is loading or user is not logged in yet. Aborting session fetch.");
      return;
    }
    try {
      const token = await getToken();
      if (!token) {
        console.error("Failed to retrieve a valid Clerk token.");
        return;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/sessions`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (res.status === 401) {
        console.error("Backend returned 401 Unauthorized. Check backend Clerk config/Secret Key.");
        return;
      }
      
      const data = await res.json();
      if (data.success) setSessions(data.sessions || []);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  // Fetch all messages for a given session
  const fetchSessionMessages = async (sessionId) => {
    if (!isLoaded || !userId) {
      console.log("Clerk is loading or user is not logged in yet. Aborting session messages fetch.");
      return;
    }
    try {
      const token = await getToken();
      if (!token) {
        console.error("Failed to retrieve a valid Clerk token for session messages.");
        return;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/history/${sessionId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (res.status === 401) {
        console.error("Backend returned 401 Unauthorized for history. Check backend Clerk config/Secret Key.");
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setActiveSessionId(sessionId);
      }
    } catch (err) {
      console.error("Failed to fetch session messages:", err);
    }
  };

  // Load sessions on component mount and when authentication details load
  useEffect(() => {
    if (isLoaded && userId) {
      fetchUserSessions();
    }
  }, [isLoaded, userId]);

  // Real voice audio recording handler using MediaRecorder
  const handleVoiceClick = async () => {
    if (!isListening) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            setBase64Audio(reader.result);
          };
          reader.readAsDataURL(audioBlob);

          // Stop all stream tracks to release microphone
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to access microphone:", err);
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsListening(false);
      }
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !base64Image && !base64Audio) || isLoading) return;

    if (!isLoaded || !userId) {
      console.log("Clerk is loading or user is not logged in yet. Aborting handleSend.");
      return;
    }

    const token = await getToken();
    if (!token) {
      console.error("Failed to retrieve a valid Clerk token for sending message.");
      return;
    }

    const userMessage = input.trim();
    const attachedImage = base64Image;
    const attachedAudio = base64Audio;
    setInput('');
    setSelectedFile(null);
    setBase64Image(null);
    setBase64Audio(null);
    
    // 1. Append user message to state
    setMessages((prev) => [...prev, { role: 'user', content: userMessage, image: attachedImage, audio: attachedAudio }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage, sessionId: activeSessionId, image: attachedImage, audio: attachedAudio })
      });

      if (res.status === 401) {
        console.error("Backend returned 401 Unauthorized for message sending. Check backend Clerk config/Secret Key.");
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Unauthorized: Access denied. Please check your authentication.' }
        ]);
        return;
      }

      if (!res.ok) {
        if (res.status === 413) {
          throw new Error('Payload too large: The attached image exceeds the maximum upload size.');
        }
        let errorMsg = 'Failed to get a response from the server.';
        try {
          const errData = await res.json();
          errorMsg = errData.error || errorMsg;
        } catch (_) {
          errorMsg = `Server error (Status ${res.status}): Please verify the backend logs.`;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();

      if (data.success) {
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
          content: `Error: ${error.message || 'Unable to connect to the backend server. Make sure it is running.'}` 
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
              <span className="truncate flex-1 font-medium">{session.title || 'New Chat'}</span>
            </button>
          ))}
        </div>

        {/* User Account / Clerk block at the bottom */}
        <div className="mt-auto p-4 border-t border-slate-800/60 bg-[#15171e]/50 backdrop-blur-md rounded-xl mx-2 my-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Active Clerk Profile Avatar Button */}
            <UserButton 
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 border border-teal-500/30 rounded-full hover:scale-105 transition-all duration-200"
                }
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-200">Account</span>
              <span className="text-xs text-teal-400 font-medium">NexAI Session</span>
            </div>
          </div>
          
          {/* Explicit Dedicated Logout Button Action */}
          <SignOutButton redirectUrl="/sign-in">
            <button className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all duration-200 group" title="Logout Account">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
            </button>
          </SignOutButton>
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
                        {msg.image && (
                          <img 
                            src={msg.image} 
                            alt="Uploaded attachment" 
                            className="max-w-full max-h-[200px] rounded-lg mb-2 object-cover border border-zinc-800"
                          />
                        )}
                        {msg.audio && (
                          <audio 
                            src={msg.audio} 
                            controls 
                            className="max-w-full rounded-lg mb-2 border border-zinc-850/50 outline-none"
                          />
                        )}
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
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setSelectedFile(file);
                  
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setBase64Image(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />

            {/* Premium File Chip Preview */}
            {selectedFile && (
              <div className="flex items-center space-x-2 bg-[#1a1b23] border border-zinc-805 rounded-lg px-3 py-1.5 mb-3 w-fit text-xs text-slate-200 shadow-md">
                <span className="truncate max-w-[200px] font-medium">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setBase64Image(null);
                  }}
                  className="text-slate-500 hover:text-slate-200 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Premium Audio Chip Preview */}
            {base64Audio && (
              <div className="flex items-center space-x-2 bg-[#1a1b23] border border-zinc-805 rounded-lg px-3 py-1.5 mb-3 w-fit text-xs text-slate-200 shadow-md">
                <span className="font-medium">🎤 Audio Note</span>
                <audio src={base64Audio} controls className="h-6 w-36 outline-none" />
                <button
                  type="button"
                  onClick={() => setBase64Audio(null)}
                  className="text-slate-500 hover:text-slate-200 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="relative rounded-3xl bg-[#111217] pl-6 pr-3 py-3 border border-zinc-805/30 focus-within:border-teal-500/40 focus-within:ring-1 focus-within:ring-teal-500/10 transition-all duration-200 shadow-2xl flex items-center justify-between space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Recording voice... Click mic again to stop." : "Ask NexAI..."}
                className="bg-transparent border-none text-white outline-none flex-1 text-[16px] placeholder-slate-500 py-1"
                disabled={isLoading}
              />
              
              <div className="flex items-center space-x-2">
                {/* File Attachment Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full text-slate-500 hover:text-slate-300 transition duration-150"
                >
                  <Image className="w-5 h-5" />
                </button>

                {/* Microphone / Voice Simulation Button */}
                <button
                  type="button"
                  onClick={handleVoiceClick}
                  className={`p-2 rounded-full transition duration-150 ${isListening ? 'animate-pulse text-teal-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                
                {/* Send Button */}
                <button
                  type="submit"
                  disabled={(!input.trim() && !base64Image && !base64Audio) || isLoading}
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
