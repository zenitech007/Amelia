'use client';

import { useState } from 'react';
import { Menu, Plus, MessageSquare, MoreVertical, Edit2, Trash2, Pin } from 'lucide-react';
import { Theme } from '../lib/types';

interface ChatData {
  id: string;
  title: string;
  isPinned: boolean;
}

interface Props {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeTheme: Theme;
  chats: ChatData[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onTogglePin: (id: string, currentStatus: boolean) => void;
  onRenameChat: (id: string, newTitle: string) => void;
}

export default function Sidebar({ 
  isSidebarOpen, setIsSidebarOpen, activeTheme, chats, 
  currentChatId, onNewChat, onSelectChat, onDeleteChat, onTogglePin, onRenameChat 
}: Props) {
  
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const pinnedChats = chats.filter(c => c.isPinned);
  const recentChats = chats.filter(c => !c.isPinned);

  const startEditing = (chat: ChatData) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
    setDropdownOpenId(null);
  };

  const handleRenameSubmit = (id: string) => {
    if (editTitle.trim()) onRenameChat(id, editTitle.trim());
    setEditingChatId(null);
  };

  const renderChatList = (chatList: ChatData[]) => (
    <div className="space-y-1">
      {chatList.map(chat => (
        <div key={chat.id} className={`relative group flex ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
          
          {editingChatId === chat.id && isSidebarOpen ? (
            // RENAME INPUT FIELD (Only visible when sidebar is open)
            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#1E1F22] border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm w-full">
              <MessageSquare size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
              <input 
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => handleRenameSubmit(chat.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(chat.id)}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-800 dark:text-gray-100"
              />
            </div>
          ) : (
            // STANDARD CHAT BUTTON
            <button 
              onClick={() => onSelectChat(chat.id)}
              title={!isSidebarOpen ? chat.title : undefined} // Shows tooltip when collapsed!
              className={`flex items-center transition-colors text-sm ${
                isSidebarOpen 
                  ? 'justify-between w-full px-3 py-2.5 rounded-lg' 
                  : 'justify-center p-3 rounded-xl mx-2' // Circular-ish when collapsed
              } ${
                currentChatId === chat.id 
                  ? 'bg-gray-200 dark:bg-gray-800 font-medium text-gray-900 dark:text-white' 
                  : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'justify-center'}`}>
                <MessageSquare size={16} className={`shrink-0 ${currentChatId === chat.id ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'}`} />
                {isSidebarOpen && <span className="truncate">{chat.title}</span>}
              </div>
              
              {/* The 3-Dot Menu Button (Shows on Hover, Only when Expanded) */}
              {isSidebarOpen && (
                <div 
                  onClick={(e) => { e.stopPropagation(); setDropdownOpenId(dropdownOpenId === chat.id ? null : chat.id); }}
                  className={`p-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-opacity ${dropdownOpenId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <MoreVertical size={16} />
                </div>
              )}
            </button>
          )}

          {/* THE DROPDOWN MENU */}
          {dropdownOpenId === chat.id && isSidebarOpen && (
            <>
              {/* Invisible overlay to close dropdown when clicking outside */}
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpenId(null)} />
              
              <div className="absolute right-2 top-10 w-36 bg-white dark:bg-[#2B2D31] border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button 
                  onClick={() => { onTogglePin(chat.id, chat.isPinned); setDropdownOpenId(null); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Pin size={14} className={chat.isPinned ? "fill-gray-700 dark:fill-gray-300" : ""} />
                  {chat.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button 
                  onClick={() => startEditing(chat)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit2 size={14} /> Rename
                </button>
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2" />
                <button 
                  onClick={() => { onDeleteChat(chat.id); setDropdownOpenId(null); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay Background */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <div className={`fixed md:relative inset-y-0 left-0 z-50 flex flex-col bg-[#f9f9f9] dark:bg-[#17181A] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
        isSidebarOpen 
          ? 'translate-x-0 w-64' 
          : '-translate-x-full md:translate-x-0 md:w-18' // <-- The Magic Gemini Collapse Width!
      }`}>
        
        {/* Hamburger Menu Area */}
        <div className={`flex items-center mt-4 mb-6 ${isSidebarOpen ? 'px-5' : 'px-0 justify-center'}`}>
          <button 
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-400" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={22} />
          </button>
        </div>
        
        {/* New Chat Button Area */}
        <div className={`mb-6 ${isSidebarOpen ? 'px-4' : 'px-2'}`}>
          <button 
            onClick={onNewChat}
            className={`flex items-center transition-all shadow-sm bg-white dark:bg-[#2B2D31] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium ${
              isSidebarOpen 
                ? 'gap-2 w-full py-2.5 px-4 rounded-xl text-sm' 
                : 'justify-center w-11 h-11 mx-auto rounded-full' // <-- Shrinks to a perfect circle!
            }`}
            title={!isSidebarOpen ? "New Chat" : undefined}
          >
            <Plus size={18} className="shrink-0" /> 
            {isSidebarOpen && <span className="truncate">New Chat</span>}
          </button>
        </div>

        {/* Chat Lists Area */}
        <div className={`flex-1 overflow-y-auto pb-10 ${isSidebarOpen ? 'px-2' : 'px-0'}`}>
          {pinnedChats.length > 0 && (
            <div className="mb-6">
              {isSidebarOpen && <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">Pinned</p>}
              {renderChatList(pinnedChats)}
            </div>
          )}

          {recentChats.length > 0 && (
            <div>
              {isSidebarOpen && <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">Recent</p>}
              {renderChatList(recentChats)}
            </div>
          )}
        </div>

      </div>
    </>
  );
}