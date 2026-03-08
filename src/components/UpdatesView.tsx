import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useUIStore } from '../stores/useUIStore';
import { AddStatusModal } from './Modals';

export const UpdatesView = () => {
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [statuses, setStatuses] = useState<any[]>([]);
  const { user } = useAuthStore();
  const { setShowAddStatusModal } = useUIStore();

  const fetchStatuses = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      const allStatuses = [
        ...(data.myStatuses || []).map((s: any) => ({
          id: 'me-' + s._id,
          name: 'My Status',
          avatar: user?.avatar_url,
          image: s.content,
          time: new Date(s.createdAt).toLocaleTimeString(),
          isOwn: true
        })),
        ...(data.friendsStatuses || []).flatMap((f: any) => f.statuses.map((s: any) => ({
          id: s._id,
          name: f.name || f.username,
          avatar: f.image || `https://ui-avatars.com/api/?name=${f.username}&background=random`,
          image: s.content,
          time: new Date(s.createdAt).toLocaleTimeString()
        })))
      ];
      setStatuses(allStatuses);
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
    }
  };

  React.useEffect(() => {
    fetchStatuses();
  }, [user]);

  return (
    <div className="flex-1 bg-[var(--bg-app)] overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight">Updates</h1>
          <button
            onClick={() => setShowAddStatusModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all"
          >
            <Plus size={20} />
            Add Status
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {statuses.map((status, idx) => (
            <motion.div
              key={status.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedStatus(status)}
              className="relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer group shadow-xl"
            >
              {status.image?.endsWith('.mp4') || status.image?.endsWith('.webm') ? (
                <video src={status.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <img
                  src={status.image}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt=""
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <div className="absolute top-4 left-4">
                <div className="p-1 rounded-full border-2 border-[var(--primary)]">
                  <img src={status.avatar} className="w-10 h-10 rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-black text-sm truncate">{status.name}</p>
                <p className="text-white/60 text-xs font-bold">{status.time}</p>
              </div>
            </motion.div>
          ))}
          {statuses.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400 font-bold italic">No updates available. Be the first to post!</p>
            </div>
          )}
        </div>
      </div>

      <AddStatusModal />


      <AnimatePresence>
        {selectedStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          >
            <button
              onClick={() => setSelectedStatus(null)}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
            >
              <X size={40} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl"
            >
              {selectedStatus.image?.endsWith('.mp4') || selectedStatus.image?.endsWith('.webm') ? (
                <video src={selectedStatus.image} className="w-full h-full object-contain bg-black" autoPlay controls />
              ) : (
                <img src={selectedStatus.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              )}

              <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent flex items-center gap-4">
                <img src={selectedStatus.avatar} className="w-12 h-12 rounded-full border-2 border-white" alt="" referrerPolicy="no-referrer" />
                <div>
                  <p className="text-white font-black">{selectedStatus.name}</p>
                  <p className="text-white/70 text-xs font-bold">{selectedStatus.time}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="absolute top-2 left-4 right-4 flex gap-1">
                <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5 }}
                    onAnimationComplete={() => setSelectedStatus(null)}
                    className="h-full bg-white"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
