import { useState, useEffect } from 'react';
import { User, Image as ImageIcon, Volume2, Square, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, USER, Theme } from '../lib/types';
import NurseAvatar from './NurseAvatar';
import remarkGfm from "remark-gfm";

interface Props {
  msg: Message;
  activeTheme: Theme;
}

export default function ChatMessage({ msg, activeTheme }: Props) {
  const isUser = msg.role === USER;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const hasImageText = msg.content.startsWith('[Image Attached]');
  const displayText = hasImageText ? msg.content.replace('[Image Attached]', '').trim() : msg.content;

  // --- WARM UP THE VOICE ENGINE ---
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices(); 
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // --- COPY TO CLIPBOARD ENGINE ---
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setIsCopied(true);
      // Revert the icon back to 'Copy' after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // --- THE TEXT-TO-SPEECH ENGINE ---
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert("Sorry, your browser doesn't support Text-to-Speech!");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = displayText
    .replace(/[#_*`>-]/g, '')
    .replace(/\n+/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const voices = window.speechSynthesis.getVoices();
    
    const preferredFemaleNames = [
      'Google UK English Female', 'Google US English', 
      'Samantha', 'Victoria', 'Karen', 'Tessa', 'Melina', 
      'Zira', 'Hazel', 'Catherine', 
      'Fiona', 'Moira', 'Veena' 
    ];

    let selectedVoice = null;

    for (const name of preferredFemaleNames) {
      const found = voices.find(v => v.name.includes(name));
      if (found) {
        selectedVoice = found;
        break;
      }
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(v => /female|girl/i.test(v.name));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = 0.95; 
    utterance.pitch = 1.1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex gap-3 w-full animate-in slide-in-from-bottom-2 duration-300 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      
      <div className="shrink-0 mt-1">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm transition-colors">
            <User size={18} />
          </div>
        ) : (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: activeTheme.primary }}
          >
            <NurseAvatar size={28} />
          </div>
        )}
      </div>

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="font-semibold text-[13px] text-gray-500 dark:text-gray-400">
            {isUser ? 'You' : 'Amelia'}
          </span>
          
          {/* COPY BUTTON */}
          <button 
            onClick={handleCopy}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isCopied ? "Copied!" : "Copy message"}
          >
            {isCopied ? <Check size={14} className="text-green-500 dark:text-green-400" /> : <Copy size={14} />}
          </button>

          {/* TEXT-TO-SPEECH BUTTON */}
          {!isUser && (
            <button 
              onClick={toggleSpeech}
              className={`p-1 rounded-md transition-colors ${isSpeaking ? 'bg-red-100 text-red-500 dark:bg-red-900/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title={isSpeaking ? "Stop speaking" : "Read aloud"}
            >
              {isSpeaking ? <Square size={12} className="fill-current" /> : <Volume2 size={14} />}
            </button>
          )}
        </div>
        
        <div 
          className={`px-5 py-3.5 shadow-sm text-[15px] leading-relaxed flex flex-col gap-2 transition-colors ${
            isUser 
              ? 'text-white rounded-2xl rounded-tr-sm' 
              : 'bg-white dark:bg-[#2B2D31] border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-sm'
          }`}
          style={isUser ? { backgroundColor: activeTheme.primary } : {}}
        >
          {msg.imageUrl && (
            <div className="relative rounded-xl overflow-hidden mb-1 border border-white/20 shadow-sm">
              <img src={msg.imageUrl} 
              alt="Uploaded image" 
              className="rounded-xl max-w-sm max-h-80 object-cover cursor-pointer hover:opacity-90 transition" 
            />
            </div>
          )}
          
          {!msg.imageUrl && hasImageText && (
             <div className="flex items-center gap-2 bg-black/10 dark:bg-white/10 px-3 py-2 rounded-lg text-sm w-fit font-medium">
                <ImageIcon size={16} /> Image Attached
             </div>
          )}

          <div className="chat-bubble prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayText}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}