'use client';

import { motion } from 'framer-motion';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '../ui/button';
import { SidebarMenuButton, useSidebar } from '../ui/sidebar';

const themes = ['light', 'system', 'dark'] as const;

export default function SidebarThemeToggle({
  classNames,
}: {
  alwaysExpanded?: boolean;
  classNames?: string;
}) {
  const { state, isMobile } = useSidebar();

  if (state === 'expanded' || isMobile)
    return <ExpandableThemeToggle alwaysExpanded className={classNames} />;

  if (state === 'collapsed')
    return <ThemeToggleButton isSidebar className={classNames} />;
}

export function ExpandableThemeToggle({
  alwaysExpanded = false,
  className,
}: {
  alwaysExpanded?: boolean;
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(alwaysExpanded);

  if (!theme) {
    return null;
  }

  const activeIndex = themes.indexOf(theme as (typeof themes)[number]);
  const activeIcon =
    theme === 'light' ? (
      <Sun className='size-4' />
    ) : theme === 'system' ? (
      <Monitor className='size-4' />
    ) : (
      <Moon className='size-4' />
    );

  return (
    <motion.div
      className={twMerge(
        'relative flex items-center bg-sidebar-accent p-1 rounded-full cursor-pointer',
        className
      )}
      initial={{ width: '2rem' }}
      animate={{ width: isExpanded ? '6rem' : '2rem' }}
      transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      onMouseEnter={() => {
        if (!alwaysExpanded) {
          setIsExpanded(true);
        }
      }}
      onMouseLeave={() => {
        if (!alwaysExpanded) {
          setIsExpanded(false);
        }
      }}
    >
      {/* Active Theme Icon */}
      {!isExpanded && (
        <div className='flex items-center justify-center w-8 h-7 text-blue-600'>
          {activeIcon}
        </div>
      )}

      {/* Full Theme Toggle (Visible on Hover) */}
      {isExpanded && (
        <>
          <motion.div
            className='absolute top-1 bottom-1 aspect-square bg-white dark:bg-gray-700 rounded-full'
            initial={{ x: activeIndex * 30 }}
            animate={{ x: activeIndex * 30 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          />
          {themes.map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className={`relative w-8 h-7 flex items-center justify-center cursor-pointer ${
                theme === mode
                  ? 'text-blue-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {mode === 'light' && <Sun className='size-4' />}
              {mode === 'system' && <Monitor className='size-4' />}
              {mode === 'dark' && <Moon className='size-4' />}
            </button>
          ))}
        </>
      )}
    </motion.div>
  );
}

function ThemeToggleButton({
  isSidebar = false,
  className,
}: {
  isSidebar?: boolean;
  className?: string;
}) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  const activeIcon =
    theme === 'light' ? (
      <Sun className='size-4' />
    ) : theme === 'system' ? (
      <Monitor className='size-4' />
    ) : (
      <Moon className='size-4' />
    );

  return (
    <div
      className={twMerge(
        'bg-accent-foreground/10 hover:bg-accent-foreground/5 active:bg-accent-foreground/10 cursor-pointer w-fit rounded-full',
        className
      )}
    >
      {!isSidebar && (
        <Button
          variant='ghost'
          size='icon'
          onClick={toggleTheme}
          className={
            'h-8 w-8 text-sidebar-foreground hover:bg-transparent rounded-full'
          }
        >
          {activeIcon}
        </Button>
      )}

      {isSidebar && (
        <SidebarMenuButton
          className='bg-transparent hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent active:text-sidebar-foreground rounded-3xl overflow-hidden'
          tooltip='Toggle theme'
          onClick={toggleTheme}
        >
          {activeIcon}
        </SidebarMenuButton>
      )}
    </div>
  );
}
