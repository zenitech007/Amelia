'use client';

import { useRef, useEffect, useState } from 'react';
import { Send, Paperclip, X, Mic, MicOff } from 'lucide-react';
import { Theme } from '../lib/types';

interface Props {
  inputText: string;
  setInputText: (text: string | ((prev: string) => string)) => void;
  sendMessage: () => void;
  isLoading: boolean;
  activeTheme: Theme;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
}

export default function ChatInput({ 
  inputText, setInputText, sendMessage, isLoading, activeTheme, imageFile, setImageFile 
}: Props) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // --- 1. AUTO-RESIZE TEXTAREA ---
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to recalculate
      // Caps out at 120px (about 5 lines) before it starts scrolling naturally
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // --- 2. IMAGE HANDLER ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    if (imageFile) URL.revokeObjectURL(imageFile as unknown as string); // release memory
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- 3. SPEECH TO TEXT HANDLER ---
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Try using Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stops automatically when you pause
    recognition.interimResults = true; // Shows words as you speak them
    recognition.lang = 'en-US'; // Defaulting to English, we can link this to the language setting later!

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      // If it's a final result, append it with a space. If interim, just update what they are currently saying.
      if (event.results[0].isFinal) {
        setInputText((prev: string) => prev + (prev ? ' ' : '') + currentTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // --- 4. GEMINI UI LOGIC ---
  const hasContent = inputText.trim().length > 0 || imageFile !== null;

  return (
    // Background gradient now supports Dark Mode!
    <div className="absolute bottom-0 w-full bg-linear-to-t from-gray-50 via-gray-50 to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent pt-8 pb-6 px-4 z-10">
      <div className="max-w-3xl mx-auto relative group">
        
        {/* --- IMAGE PREVIEW BUBBLE --- */}
        {imageFile && (
          <div className="absolute -top-28 left-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="relative w-36 h-28 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              
              {/* Image */}
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Upload preview"
                className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
              />

              {/* Cancel Button */}
              <button
                onClick={() => {
                  clearImage();
                }}
                className="absolute top-1 right-1 bg-gray-800 dark:bg-gray-600 hover:bg-gray-700 text-white rounded-full p-1 shadow-md transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* --- MAIN INPUT WRAPPER --- */}
        <div className="relative flex items-end bg-white dark:bg-[#1E1F22] border border-gray-300 dark:border-gray-700 rounded-3xl shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-opacity-50" style={{ '--tw-ring-color': activeTheme.primary } as React.CSSProperties}>
          
          {/* Hidden File Input */}
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          
          {/* LEFT: Paperclip Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-3 mb-1 ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 shrink-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Attach an image"
          >
            <Paperclip size={22} />
          </button>

          {/* CENTER: Auto-resizing Textarea */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask a health question or upload a scan..."
            rows={1}
            className="w-full max-h-30 py-4 px-2 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none outline-none overflow-y-auto leading-relaxed"
            // We removed the Enter to send! Enter now creates a new paragraph naturally.
          />
          
          {/* RIGHT: Dynamic Button Area (Mic OR Send) */}
          <div className="p-2 mb-1 mr-1 shrink-0 flex items-center justify-center min-w-12">
            {hasContent ? (
              // SHOW SEND BUTTON
              <button 
                onClick={sendMessage}
                disabled={isLoading}
                className="p-2.5 rounded-full text-white transition-all hover:scale-105 shadow-sm disabled:opacity-50 disabled:hover:scale-100 animate-in zoom-in duration-200"
                style={{ backgroundColor: activeTheme.primary }}
              >
                <Send size={18} className="ml-0.5" />
              </button>
            ) : (
              // SHOW MIC BUTTON
              <button 
                onClick={toggleListening}
                disabled={isLoading}
                className={`p-2.5 rounded-full transition-colors duration-200 animate-in zoom-in ${
                  isListening 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 animate-pulse' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Use voice typing"
              >
                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
            )}
          </div>

        </div>
      </div>
      
      <div className="text-center mt-3 text-xs text-gray-400 dark:text-gray-500">
        A.M.E.L.I.A. can make mistakes. Please verify important medical information with a doctor.
      </div>
    </div>
  );
}