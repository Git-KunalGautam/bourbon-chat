import React from 'react';
import { motion } from 'motion/react';
import { useAuthStore } from '../stores/useAuthStore';
import { Camera, Mail, User as UserIcon, Shield, Bell, Globe } from 'lucide-react';

export const ProfileView = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex-1 bg-[var(--bg-app)] overflow-y-auto py-4 px-2 md:py-8 md:px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-3xl p-8 shadow-xl"
        >
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-6">
              <img
                src={user?.avatar_url}
                alt={user?.username}
                className="w-32 h-32 rounded-huge object-cover border-4 border-white shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <button className="absolute bottom-0 right-0 p-3 bg-[var(--primary)] text-white rounded-full shadow-lg hover:scale-110 transition-all">
                <Camera size={20} />
              </button>
            </div>
            <h2 className="text-3xl font-black text-[var(--text-main)] mb-1">{user?.username}</h2>
            <p className="text-[var(--text-muted)] font-bold">Premium Member</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-[var(--border)]">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                <UserIcon size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Username</p>
                <p className="text-[var(--text-main)] font-bold">{user?.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-[var(--border)]">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Email Address</p>
                <p className="text-[var(--text-main)] font-bold">{user?.email}</p>
              </div>
            </div>
          </div>

          <button className="w-full mt-10 py-4 bg-[var(--primary)] text-white rounded-2xl font-black shadow-xl shadow-[var(--primary-light)] hover:scale-[1.02] active:scale-[0.98] transition-all">
            Update Profile
          </button>
        </motion.div>
      </div>
    </div>
  );
};
