"use client";

import React, { useEffect } from 'react';
import { NavRail } from '../components/NavRail';
import { ChatList } from '../components/ChatList';
import { ModernChat } from '../components/ModernChat';
import { RightSidebar } from '../components/RightSidebar';
import { UpdatesView } from '../components/UpdatesView';
import { SettingsView } from '../components/SettingsView';
import { ProfileView } from '../components/ProfileView';
import { useUIStore } from '../stores/useUIStore';
import { useAuthStore } from '../stores/useAuthStore';
import { Auth } from '../components/Auth';
import { motion } from 'motion/react';
import { useSession } from 'next-auth/react';

export default function Home() {
    const { theme, activeTab } = useUIStore();
    const { status, data: session } = useSession();
    const { login, logout, user } = useAuthStore();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            login({
                id: (session.user as any).id || session.user.email!,
                email: session.user.email!,
                username: session.user.name || session.user.email!.split('@')[0],
                avatar_url: session.user.image || undefined,
            });
        } else if (status === 'unauthenticated') {
            logout();
        }
    }, [status, session, login, logout]);

    if (status === 'loading') {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[var(--bg-app)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return <Auth />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'chats':
            case 'communities':
                return (
                    <>
                        <ChatList />
                        <motion.div
                            layout
                            className="flex-1 flex flex-col min-w-0"
                        >
                            <ModernChat />
                        </motion.div>
                        <RightSidebar />
                    </>
                );
            case 'updates':
                return <UpdatesView />;
            case 'settings':
                return <SettingsView />;
            case 'profile':
                return <ProfileView />;
            default:
                return (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                        <div className="w-24 h-24 bg-[var(--primary-glow)] rounded-3xl flex items-center justify-center mb-6">
                            <span className="text-4xl">🚧</span>
                        </div>
                        <h2 className="text-3xl font-black text-[var(--text-main)] mb-2 uppercase tracking-tight">
                            {activeTab} Section
                        </h2>
                        <p className="text-[var(--text-muted)] font-bold max-w-sm">
                            This module is currently under development. Stay tuned for premium updates.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-app)]">
            {/* Nav Rail (Far Left) */}
            <NavRail />

            {/* Main Content Area */}
            {renderContent()}
        </div>
    );
}
