import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useUIStore } from '../stores/useUIStore';
import { AddStatusModal } from './Modals';
import { toast } from 'react-toastify';
import Image from 'next/image';

export const UpdatesView = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [statuses, setStatuses] = useState<any[]>([]);
  const { user } = useAuthStore();
  const { setShowAddStatusModal } = useUIStore();

  const fetchStatuses = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      const allUsers: any[] = [];

      if (data.myStatuses && data.myStatuses.length > 0) {
        allUsers.push({
          id: 'me',
          name: 'My Status',
          avatar: user?.avatar_url || (user as any)?.image,
          isOwn: true,
          statuses: data.myStatuses.map((s: any) => ({
            id: s._id,
            image: s.mediaUrl || ((s.content && (s.content.startsWith('/status/') || s.content.startsWith('/media/status/'))) ? s.content : ''),
            description: s.content && !(s.content.startsWith('/status/') || s.content.startsWith('/media/status/')) ? s.content : '',
            time: new Date(s.createdAt).toLocaleTimeString()
          }))
        });
      }

      if (data.friendsStatuses && data.friendsStatuses.length > 0) {
        const friendsWithStatus = data.friendsStatuses.filter((f: any) => f.statuses && f.statuses.length > 0);
        const mappedFriends = friendsWithStatus.map((f: any) => ({
          id: f.userId,
          name: f.name || f.username,
          avatar: f.image || `https://ui-avatars.com/api/?name=${f.username}&background=random`,
          isOwn: false,
          statuses: f.statuses.map((s: any) => ({
            id: s._id,
            image: s.mediaUrl || ((s.content && (s.content.startsWith('/status/') || s.content.startsWith('/media/status/'))) ? s.content : ''),
            description: s.content && !(s.content.startsWith('/status/') || s.content.startsWith('/media/status/')) ? s.content : '',
            time: new Date(s.createdAt).toLocaleTimeString()
          }))
        }));
        allUsers.push(...mappedFriends);
      }

      setStatuses(allUsers);
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
      toast.error('Failed to load statuses');
    }
  };

  const handleDelete = async () => {
    try {
      const formData = new FormData();
      formData.append('action', 'deleteAll');
      const res = await fetch('/api/status', { method: 'POST', body: formData });
      if (res.ok) {
        toast.success('All your statuses deleted');
        setSelectedUser(null);
        setCurrentStatusIndex(0);
        fetchStatuses();
      } else {
        toast.error('Failed to delete status');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete status');
    }
  };
  const currentStatus = selectedUser ? selectedUser.statuses[currentStatusIndex] : null;

  const handleDeleteCurrent = async () => {
    if (!currentStatus) return;
    try {
      const formData = new FormData();
      formData.append('action', 'delete');
      formData.append('statusId', currentStatus.id);
      const res = await fetch('/api/status', { method: 'POST', body: formData });
      if (res.ok) {
        toast.success('Status deleted');
        setSelectedUser(null); // Close viewer to refresh properly
        setCurrentStatusIndex(0);
        fetchStatuses();
      } else {
        toast.error('Failed to delete status');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete status');
    }
  };
  const handleNextStatus = () => {
    if (selectedUser && currentStatusIndex < selectedUser.statuses.length - 1) {
      setCurrentStatusIndex(prev => prev + 1);
    } else {
      setSelectedUser(null);
    }
  };

  React.useEffect(() => {
    fetchStatuses();
  }, [user]);

  const { showAddStatusModal } = useUIStore();

  React.useEffect(() => {
    if (!showAddStatusModal) {
      fetchStatuses();
    }
  }, [showAddStatusModal]);

  return (
    <div className="flex-1 bg-[var(--bg-app)] overflow-y-auto py-4 px-2 md:py-8 md:px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-4xl font-black text-[var(--text-main)] tracking-tight">Updates</h1>
          <button
            onClick={() => setShowAddStatusModal(true)}
            className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-[var(--primary)] text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all"
          >
            <Plus size={20} />
            Add Status
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {statuses.map((userStatus, idx) => {
            const previewStatus = userStatus.statuses[userStatus.statuses.length - 1];
            return (
              <motion.div
                key={userStatus.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => { setSelectedUser(userStatus); setCurrentStatusIndex(0); }}
                className="relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer group shadow-xl"
              >
                {previewStatus.image ? (
                  previewStatus.image.endsWith('.mp4') || previewStatus.image.endsWith('.webm') ? (
                    <video src={previewStatus.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <Image
                      src={previewStatus.image}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      alt="Status preview"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white p-4 text-center font-bold">
                    {previewStatus.description}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute top-4 left-4 z-10">
                  <div className="p-[2px] rounded-full border-2 border-[var(--primary)] relative w-11 h-11 bg-[var(--bg-card)]">
                    <Image src={userStatus.avatar} fill unoptimized className="rounded-full object-cover" alt="Avatar" />
                    {userStatus.statuses.length > 1 && (
                      <div className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-[10px] w-5 h-5 border-2 border-[var(--bg-app)] rounded-full flex items-center justify-center font-black z-20">
                        {userStatus.statuses.length}
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-black text-sm truncate">{userStatus.name}</p>
                  <p className="text-white/60 text-xs font-bold">{previewStatus.time}</p>
                </div>
              </motion.div>
            )
          })}
          {statuses.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-[var(--text-muted)] font-bold italic">No updates available. Be the first to post!</p>
            </div>
          )}
        </div>
      </div>

      <AddStatusModal />


      <AnimatePresence>
        {selectedUser && currentStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          >
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[60]"
            >
              <X size={40} />
            </button>

            <motion.div
              key={currentStatus.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={handleNextStatus}
              className="relative max-w-lg w-full aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
            >
              {currentStatus.image ? (
                currentStatus.image.endsWith('.mp4') || currentStatus.image.endsWith('.webm') ? (
                  <video src={currentStatus.image} className="w-full h-full object-contain bg-black" autoPlay controls onEnded={handleNextStatus} />
                ) : (
                  <Image src={currentStatus.image} fill unoptimized className="object-cover" alt="Status full" />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] p-8">
                  <p className="text-white text-3xl font-black text-center leading-tight drop-shadow-xl z-10">{currentStatus.description}</p>
                </div>
              )}

              <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent flex flex-col gap-2">
                <div className="flex gap-1 w-full relative z-10">
                  {selectedUser.statuses.map((_: any, i: number) => {
                    const isVideo = currentStatus.image && (currentStatus.image.endsWith('.mp4') || currentStatus.image.endsWith('.webm'));
                    return (
                      <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: i < currentStatusIndex ? '100%' : '0%' }}
                          animate={{ width: i === currentStatusIndex ? '100%' : (i < currentStatusIndex ? '100%' : '0%') }}
                          transition={{ duration: i === currentStatusIndex ? (isVideo ? 30 : 5) : 0 }}
                          onAnimationComplete={() => { if (i === currentStatusIndex && !isVideo) handleNextStatus() }}
                          className="h-full bg-white"
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 relative rounded-full border-2 border-white overflow-hidden bg-[var(--bg-card)]">
                      <Image src={selectedUser.avatar} fill unoptimized className="object-cover" alt="Avatar" />
                    </div>
                    <div>
                      <p className="text-white font-black text-sm drop-shadow-md">{selectedUser.name}</p>
                      <p className="text-white/80 text-xs font-bold drop-shadow-md">{currentStatus.time}</p>
                    </div>
                  </div>
                  {selectedUser.isOwn && (
                    <div className="flex items-center gap-2 z-[60]">
                      <button onClick={(e) => { e.stopPropagation(); setShowAddStatusModal(true); setSelectedUser(null); }} className="px-2 py-1.5 bg-blue-500/80 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold transition-colors shadow-lg">
                        Add/Update
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteCurrent(); }} className="px-2 py-1.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-xl text-[10px] font-bold transition-colors shadow-lg">
                        Delete
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="px-2 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-[10px] font-bold transition-colors shadow-lg">
                        Delete All
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {currentStatus.description && currentStatus.image && (
                <div className="absolute bottom-10 left-0 right-0 p-6 text-center">
                  <p className="text-white text-lg font-bold drop-shadow-md bg-black/40 inline-block px-4 py-2 rounded-2xl backdrop-blur-sm">
                    {currentStatus.description}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
