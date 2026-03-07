import React from 'react';
import { useThemeStore, ThemeType } from '../stores/useThemeStore';
import { cn } from '../lib/utils';

const themes: { id: ThemeType; color: string; label: string }[] = [
  { id: 'classic-mint', color: '#00a884', label: 'Classic Mint' },
  { id: 'ocean-blue', color: '#3b82f6', label: 'Ocean Blue' },
  { id: 'bourbon-amber', color: '#f59e0b', label: 'Bourbon Amber' },
  { id: 'amethyst-purple', color: '#8b5cf6', label: 'Amethyst Purple' },
  { id: 'midnight-dark', color: '#ffffff', label: 'Midnight Dark' },
];

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-2 p-2">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={cn(
            "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
            theme === t.id ? "border-primary scale-110" : "border-transparent"
          )}
          style={{ backgroundColor: t.id === 'midnight-dark' ? '#000' : t.color }}
          title={t.label}
        />
      ))}
    </div>
  );
};
