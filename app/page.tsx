'use client'; 

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Menu, Activity } from 'lucide-react';

import { Message, USER, AMELIA } from '../lib/types';
import { THEMES } from '../lib/themes';
import { createClient } from '../lib/supabaseClient';

import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import SettingsModal from '../components/SettingsModal';
import TypingIndicator from '../components/TypingIndicator';
import NurseAvatar from '../components/NurseAvatar';
import HealthDashboard from '../components/HealthDashboard';
import AmeliaAlert, { AlertData } from '../components/AmeliaAlert';

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  // --- AUTH STATE ---
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [patientProfile, setPatientProfile] = useState<any>(null);

  // --- APP STATE ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeTheme, setActiveTheme] = useState(THEMES.rose);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  // --- PHASE 3: DASHBOARD & ALERTS STATE ---
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [alertData, setAlertData] = useState<AlertData | null>(null);

  const triggerAlert = (message: string, type: 'success' | 'warning' | 'info' | 'reminder') => {
    setAlertData({ id: Date.now().toString(), type, message });
  };

  // --- DATABASE STATE ---
  const [chats, setChats] = useState<{id: string, title: string, isPinned: boolean}[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // --- 0. INITIALIZE DARK MODE ON LOAD ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // --- 1. AUTHENTICATION & ONBOARDING LOCK ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      const res = await fetch(`/api/profile?userId=${session.user.id}`, { cache: 'no-store' });
      const profile = await res.json();

      if (!profile || !profile.id) {
        router.push('/onboarding');
      } else {
        setUser(session.user);
        setPatientProfile(profile);
        fetchSidebarChats(session.user.id);
        setIsAuthChecking(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login');
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  // --- 2. LOAD ALL PRIVATE CHATS ---
  const fetchSidebarChats = (userId: string) => {
    fetch(`/api/chats?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setChats(data);
      });
  };

  // --- 3. START A NEW CHAT ---
  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  // --- 4. OPEN AN EXISTING CHAT ---
  const handleSelectChat = async (id: string) => {
    setCurrentChatId(id);
    setIsSidebarOpen(false); 
    
    try {
      const res = await fetch(`/api/chats/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.messages) {
          setMessages(data.messages);
        }
      } else {
        console.error("Failed to load chat history from the database.");
      }
    } catch (error) {
      console.error("Network error while loading chat:", error);
    }
  };

  // --- 5. RENAME CHAT ---
  const handleRenameChat = async (id: string, newTitle: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === id ? { ...chat, title: newTitle } : chat
    ));

    await fetch(`/api/chats/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    });
  };

  // --- 6. PIN/UNPIN CHAT ---
  const handleTogglePin = async (id: string, currentStatus: boolean) => {
    setChats(prev => prev.map(chat => 
      chat.id === id ? { ...chat, isPinned: !currentStatus } : chat
    ));

    await fetch(`/api/chats/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !currentStatus })
    });
  };

  // --- 7. DELETE CHAT ---
  const handleDeleteChat = async (id: string) => {
    await fetch(`/api/chats/${id}`, { method: 'DELETE' });
    if (currentChatId === id) handleNewChat(); 
    if (user) fetchSidebarChats(user.id); 
  };

  // --- 8. SEND MESSAGE LOGIC ---
  const sendMessage = async () => {
    if ((!inputText.trim() && !imageFile) || !user) return; 

    const userText = inputText.trim() || "Uploaded an image"; 
    
    let base64Image = null;
    if (imageFile) {
      base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    }

    const userMessage: Message = { 
      role: USER, 
      content: imageFile ? `[Image Attached] ${userText}` : userText,
      imageUrl: base64Image || undefined
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    setInputText(''); 
    setImageFile(null); 
    setIsLoading(true); 

    let activeChatId = currentChatId;

    try {
      if (!activeChatId) {
        const title = userText.length > 30 ? userText.substring(0, 30) + '...' : userText;
        const res = await fetch('/api/chats', {
          method: 'POST',
          body: JSON.stringify({ 
            title, 
            firstMessage: userText, 
            role: USER,
            userId: user.id, 
            email: user.email 
          })
        });
        const newChat = await res.json();
        activeChatId = newChat.id;
        setCurrentChatId(activeChatId);
        fetchSidebarChats(user.id);
      } else {
        await fetch('/api/chats', {
          method: 'PUT',
          body: JSON.stringify({ chatId: activeChatId, role: USER, content: userMessage.content })
        });
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/chat`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_message: userText,
          session_id: activeChatId,
          profile: patientProfile || {},
          image_data: base64Image
        })
      });
      
      setIsLoading(false); 
      let ameliaText = "";
      setMessages((prev) => [...prev, { role: AMELIA, content: ameliaText }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          ameliaText += chunk;

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: AMELIA, content: ameliaText };
            return updated;
          });
        }
      }

      await fetch('/api/chats', {
        method: 'PUT',
        body: JSON.stringify({ chatId: activeChatId, role: AMELIA, content: ameliaText })
      });

    } catch (error) {
      setIsLoading(false);
      setMessages((prev) => [...prev, { role: AMELIA, content: "I'm sorry, I am having trouble connecting right now." }]);
    } 
  };

  if (isAuthChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#1E1F22] transition-colors duration-300">
        <div className="animate-pulse text-[#FC94AF] font-semibold text-lg flex items-center gap-2">
          <NurseAvatar size={40} /> Verifying Identity...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#1E1F22] font-sans text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-300">
      
      {/* THE DYNAMIC FLOATING NOTIFICATION SYSTEM */}
      <AmeliaAlert alert={alertData} onClose={() => setAlertData(null)} activeTheme={activeTheme} />

      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        activeTheme={activeTheme}
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onTogglePin={handleTogglePin}
        onRenameChat={handleRenameChat}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative bg-white dark:bg-[#1E1F22] transition-colors duration-300">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 shrink-0 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors ${isSidebarOpen ? 'hidden md:hidden' : 'block'}`}
            >
              <Menu size={22} className="text-gray-600 dark:text-gray-400" />
            </button>
            <span className="font-semibold text-lg tracking-wide text-gray-800 dark:text-gray-200">Amelia</span>
          </div>
          
          {/* UPDATED HEADER BUTTONS: Dashboard + Settings */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsDashboardOpen(true)} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Daily Vitals"
            >
              <Activity size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Settings"
            >
              <Settings size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </header>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-8 pb-32">
            
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full mt-32 text-center opacity-80 animate-in fade-in duration-700">
                <div className="mb-6 shadow-md rounded-full border-4 border-white dark:border-[#1E1F22] transition-colors duration-300">
                  <NurseAvatar size={80} />
                </div>
                <h2 className="text-2xl font-semibold mb-2 dark:text-white">How can I help you today?</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  I am equipped to provide medical information, analyze symptoms, and guide your daily wellness routines.
                </p>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((msg, index) => (
              <ChatMessage key={index} msg={msg} activeTheme={activeTheme} />
            ))}
            
            {isLoading && <TypingIndicator activeTheme={activeTheme} />}
            <div ref={bottomRef} />
          </div>
        </div>

        <ChatInput 
          inputText={inputText} 
          setInputText={setInputText} 
          sendMessage={sendMessage} 
          isLoading={isLoading} 
          activeTheme={activeTheme} 
          imageFile={imageFile} 
          setImageFile={setImageFile}
        />
      </div>

      {isSettingsOpen && (
        <SettingsModal 
          setIsSettingsOpen={setIsSettingsOpen} 
          activeTheme={activeTheme} 
          setActiveTheme={setActiveTheme}
          patientProfile={patientProfile}
          setPatientProfile={setPatientProfile}
          user={user}
        />
      )}

      {/* THE NEW VITALS DASHBOARD */}
      <HealthDashboard 
        isOpen={isDashboardOpen}
        setIsOpen={setIsDashboardOpen}
        user={user}
        activeTheme={activeTheme}
        triggerAlert={triggerAlert}
      />
      
    </div>
  );
}