import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAppContext } from '../contexts/AppContext';
import { SparklesIcon, MoonIcon, SunIcon, Bars3Icon, BoltIcon, COMMON_BUTTON_FOCUS_CLASSES, YELLOW_BUTTON_FOCUS_CLASSES } from '../constants';

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileSidebar }) => {
  const [theme, toggleTheme] = useTheme();
  const { setIsZenMode } = useAppContext(); 

  // Header is only rendered if !isZenMode (handled in App.tsx)

  return (
    <header className="bg-[var(--bg-primary)] shadow-md p-3 px-4 md:px-6 border-b border-[var(--border-color)] sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
            <button
              onClick={toggleMobileSidebar}
              aria-label="Open menu"
              className={`p-2 rounded-full hover:bg-opacity-20 hover:bg-[var(--bg-secondary)] transition-colors md:hidden ${COMMON_BUTTON_FOCUS_CLASSES}`}
            >
              <Bars3Icon className="w-6 h-6 text-[var(--text-primary)]" />
            </button>
            <SparklesIcon className="w-7 h-7 text-[var(--accent1)] hidden sm:block" />
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">PromptCraft IDE</h1>
        </div>
        <div className="flex items-center gap-2">
            <button
              onClick={() => setIsZenMode(true)}
              aria-label="Switch to Zen Mode"
              title="Switch to Zen Mode"
              className={`p-2 rounded-full hover:bg-[var(--accent-special)] hover:bg-opacity-20 transition-colors ${YELLOW_BUTTON_FOCUS_CLASSES}`}
            >
              <BoltIcon className="w-5 h-5 text-[var(--accent-special)]" />
            </button>
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className={`p-2 rounded-full hover:bg-opacity-20 hover:bg-[var(--bg-secondary)] transition-colors ${COMMON_BUTTON_FOCUS_CLASSES}`}
            >
              {theme === 'light' ? <MoonIcon className="w-5 h-5 text-[var(--accent1)]" /> : <SunIcon className="w-5 h-5 text-[var(--accent-special)]" />}
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
