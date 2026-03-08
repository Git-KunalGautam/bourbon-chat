import React, { useState } from 'react';
import { useUIStore } from '../stores/useUIStore';
import { Search, X, UserPlus, Mail, User as UserIcon, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useChatStore } from '../stores/useChatStore';

export const AddFriendModal = () => {
    const { showAddFriendModal, setShowAddFriendModal } = useUIStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'username' | 'email'>('username');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [requesting, setRequesting] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!searchQuery) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}&type=${searchType}`);
            const data = await response.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async (targetUserId: string) => {
        setRequesting(targetUserId);
        try {
            const response = await fetch('/api/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId }),
            });
            const data = await response.json();
            if (data.message) {
                alert('Friend request sent!');
            } else {
                alert(data.error || 'Failed to send request');
            }
        } catch (error) {
            console.error('Request failed:', error);
        } finally {
            setRequesting(null);
        }
    };

    if (!showAddFriendModal) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Add New Friend</h2>
                    <button onClick={() => setShowAddFriendModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setSearchType('username')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${searchType === 'username' ? 'bg-white shadow-sm text-[var(--primary)]' : 'text-slate-500'}`}
                        >
                            <UserIcon size={16} /> Username
                        </button>
                        <button
                            onClick={() => setSearchType('email')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${searchType === 'email' ? 'bg-white shadow-sm text-[var(--primary)]' : 'text-slate-500'}`}
                        >
                            <Mail size={16} /> Email
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={`Search by ${searchType}...`}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[var(--primary-light)] rounded-2xl py-4 pl-12 pr-4 text-sm outline-none transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <button
                            onClick={handleSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--primary)] text-white text-xs font-bold py-1.5 px-4 rounded-xl hover:scale-105 transition-all"
                        >
                            Search
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {loading ? (
                            <div className="text-center py-8 text-slate-400 font-bold uppercase tracking-widest text-xs">Searching...</div>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <div key={user._id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-[var(--primary-light)] transition-all">
                                    <img src={user.image || `https://ui-avatars.com/api/?name=${user.username || user.name}&background=random`} className="w-12 h-12 rounded-xl object-cover" alt="" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 truncate">{user.username || user.name}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => sendFriendRequest(user._id)}
                                        disabled={requesting === user._id}
                                        className="p-2 bg-[var(--primary-light)] text-[var(--primary)] rounded-xl hover:scale-110 transition-all disabled:opacity-50"
                                    >
                                        <UserPlus size={20} />
                                    </button>
                                </div>
                            ))
                        ) : searchQuery ? (
                            <div className="text-center py-8 text-slate-400 font-bold uppercase tracking-widest text-xs">No users found</div>
                        ) : (
                            <div className="text-center py-8 text-slate-300 font-bold uppercase tracking-widest text-xs italic">Start searching to add friends</div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export const AddGroupModal = () => {
    const { showAddGroupModal, setShowAddGroupModal } = useUIStore();
    const { fetchConversations } = useChatStore();
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'username' | 'email'>('username');
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}&type=${searchType}`);
            const data = await response.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (user: any) => {
        if (selectedUsers.find(u => u._id === user._id)) {
            setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const createGroup = async () => {
        if (!groupName || selectedUsers.length === 0) {
            alert('Please enter group name and select at least one member');
            return;
        }
        setCreating(true);
        try {
            const response = await fetch('/api/groups/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: groupName,
                    participantIds: selectedUsers.map(u => u._id)
                }),
            });
            const data = await response.json();
            if (data.conversation) {
                setShowAddGroupModal(false);
                fetchConversations();
                alert('Group created successfully!');
            } else {
                alert(data.error || 'Failed to create group');
            }
        } catch (error) {
            console.error('Create group failed:', error);
        } finally {
            setCreating(false);
        }
    };

    if (!showAddGroupModal) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Add New Group</h2>
                    <button onClick={() => setShowAddGroupModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Enter Group Name</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Ex: Bourbon Lovers"
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[var(--primary-light)] rounded-2xl py-4 px-4 text-sm font-bold outline-none transition-all"
                        />
                    </div>

                    <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setSearchType('username')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${searchType === 'username' ? 'bg-white shadow-sm text-[var(--primary)]' : 'text-slate-500'}`}
                        >
                            <UserIcon size={16} /> Username
                        </button>
                        <button
                            onClick={() => setSearchType('email')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${searchType === 'email' ? 'bg-white shadow-sm text-[var(--primary)]' : 'text-slate-500'}`}
                        >
                            <Mail size={16} /> Email
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={`Search members by ${searchType}...`}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-[var(--primary-light)] rounded-2xl py-4 pl-12 pr-4 text-sm outline-none transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <button
                            onClick={handleSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--primary)] text-white text-xs font-bold py-1.5 px-4 rounded-xl hover:scale-105 transition-all"
                        >
                            Search
                        </button>
                    </div>

                    {selectedUsers.length > 0 && (
                        <div className="mb-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selected Members ({selectedUsers.length})</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map(user => (
                                    <div key={user._id} className="bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                                        {user.username || user.name}
                                        <button onClick={() => toggleUser(user)}><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar mb-6 pr-2">
                        {loading ? (
                            <div className="text-center py-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Searching...</div>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <div
                                    key={user._id}
                                    onClick={() => toggleUser(user)}
                                    className={`flex items-center gap-4 p-3 rounded-2xl border-2 cursor-pointer transition-all ${selectedUsers.find(u => u._id === user._id) ? 'bg-[var(--primary-light)] border-[var(--primary)]' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                                >
                                    <img src={user.image || `https://ui-avatars.com/api/?name=${user.username || user.name}&background=random`} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm truncate">{user.username || user.name}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{user.email}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedUsers.find(u => u._id === user._id) ? 'bg-[var(--primary)] border-[var(--primary)] text-white' : 'border-slate-300'}`}>
                                        {selectedUsers.find(u => u._id === user._id) && <Plus size={12} />}
                                    </div>
                                </div>
                            ))
                        ) : searchQuery ? (
                            <div className="text-center py-4 text-slate-400 font-bold text-xs uppercase tracking-widest">No users found</div>
                        ) : null}
                    </div>

                    <button
                        onClick={createGroup}
                        disabled={creating || !groupName || selectedUsers.length === 0}
                        className="w-full py-4 bg-[var(--primary)] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-[var(--primary-light)]"
                    >
                        {creating ? 'Creating...' : 'Create Group'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export const AddStatusModal = () => {
    const { showAddStatusModal, setShowAddStatusModal } = useUIStore();
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);

    const handleAdd = async () => {
        if (!content && !mediaFile) return;
        setAdding(true);
        try {
            const formData = new FormData();
            formData.append('content', content || 'My Status');
            if (mediaFile) {
                formData.append('media', mediaFile);
            } else {
                formData.append('mediaType', 'text');
            }

            const response = await fetch('/api/status', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.message) {
                setShowAddStatusModal(false);
                setContent('');
                setMediaFile(null);
                setPreviewUrl(null);
                alert('Status updated!');
            } else {
                alert(data.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Add status failed:', error);
        } finally {
            setAdding(false);
        }
    };

    if (!showAddStatusModal) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Add Status</h2>
                    <button onClick={() => setShowAddStatusModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    {previewUrl ? (
                        <div className="relative mb-6 rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                            {mediaFile?.type.startsWith('video') ? (
                                <video src={previewUrl} className="w-full h-full object-contain" controls />
                            ) : (
                                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                            )}
                            <button
                                onClick={() => { setMediaFile(null); setPreviewUrl(null); }}
                                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border)] rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Plus className="w-8 h-8 mb-2 text-slate-400" />
                                    <p className="text-sm font-bold text-slate-500">Click to upload image or video</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,video/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            setMediaFile(file);
                                            setPreviewUrl(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    )}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Add a caption..."
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-[var(--primary-light)] rounded-2xl py-4 px-4 text-sm font-bold outline-none transition-all resize-none h-24 mb-6"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={adding || (!content && !mediaFile)}
                        className="w-full py-4 bg-[var(--primary)] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg"
                    >
                        {adding ? 'Posting...' : 'Post Status'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export const NotificationsPanel = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { fetchConversations } = useChatStore();

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleAccept = async (fromUserId: string) => {
        try {
            const response = await fetch('/api/friends/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromUserId }),
            });
            const data = await response.json();
            if (data.message) {
                fetchNotifications();
                fetchConversations();
                // Optionally auto-open the chat
                window.location.reload(); // Quickest way to sync everything
            }
        } catch (error) {
            console.error('Accept failed:', error);
        }
    };

    const handleReject = async (fromUserId: string) => {
        try {
            const response = await fetch('/api/friends/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromUserId }),
            });
            if (response.ok) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Reject failed:', error);
        }
    };

    if (loading && notifications.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Friend Requests</p>
                <span className="text-xs font-black text-[var(--primary)]">{notifications.length}</span>
            </div>

            {notifications.filter(n => n.status === 'pending').length === 0 ? (
                <p className="text-xs text-slate-400 font-bold italic text-center py-4">No new requests</p>
            ) : (
                notifications.filter(n => n.status === 'pending').map((notif) => (
                    <div key={notif._id} className="bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-[var(--primary-light)] transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <img src={notif.from.image || `https://ui-avatars.com/api/?name=${notif.from.username || notif.from.name}&background=random`} className="w-10 h-10 rounded-xl" alt="" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{notif.from.username || notif.from.name}</p>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${notif.status === 'pending' ? 'bg-amber-400 animate-pulse' :
                                        notif.status === 'accepted' ? 'bg-emerald-500' : 'bg-rose-500'
                                        }`}></span>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{notif.status}</p>
                                </div>
                            </div>
                        </div>
                        {notif.status === 'pending' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAccept(notif.from._id)}
                                    className="flex-1 py-2 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 transition-all shadow-md shadow-[var(--primary-light)]"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleReject(notif.from._id)}
                                    className="flex-1 py-2 bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 transition-all"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};
