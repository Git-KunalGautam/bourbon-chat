import React from 'react';
import { motion } from 'motion/react';
import { User, Shield, Bell, Globe, ChevronRight } from 'lucide-react';

export const SettingsView = () => {
  const sections = [
    { id: 'account', icon: <User size={20} />, title: 'Account Details', desc: 'Manage your profile and security' },
    { id: 'privacy', icon: <Shield size={20} />, title: 'Privacy', desc: 'Control who can see your activity' },
    { id: 'notifications', icon: <Bell size={20} />, title: 'Notifications', desc: 'Customize your alert preferences' },
    { id: 'language', icon: <Globe size={20} />, title: 'App Language', desc: 'Choose your preferred language' },
  ];

  return (
    <div className="flex-1 bg-[var(--bg-app)] overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-[var(--text-main)] mb-8 tracking-tight">Settings</h1>
        
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-effect rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all border border-transparent hover:border-[var(--primary-light)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)]">{section.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] font-medium">{section.desc}</p>
                </div>
              </div>
              <ChevronRight className="text-[var(--text-muted)]" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
