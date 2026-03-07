import { Theme } from '../lib/types';
import NurseAvatar from './NurseAvatar'; // Swapped for consistency with your chat messages!

export default function TypingIndicator({ activeTheme }: { activeTheme: Theme }) {
  return (
    <div className="flex gap-3 items-center w-full animate-in slide-in-from-bottom-2 duration-300">
      
      {/* Avatar */}
      <div className="shrink-0 mt-1">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm"
          style={{ backgroundColor: activeTheme.primary }}
        >
          <NurseAvatar size={28} />
        </div>
      </div>

      {/* Dark Mode Ready Typing Bubble */}
      <div className="flex gap-1.5 bg-gray-50 dark:bg-[#2B2D31] px-4 py-3.5 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></span>
        <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
      
    </div>
  );
}