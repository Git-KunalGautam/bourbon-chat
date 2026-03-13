import React from 'react';
import { motion } from 'motion/react';
import { User, Shield, Bell, Globe, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from 'react-toastify';
import { useUIStore } from '../stores/useUIStore';

export const SettingsView = () => {
  const { user, updateProfile } = useAuthStore();
  const { browserNotifications, setBrowserNotifications } = useUIStore();
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    username: user?.username || '',
    name: user?.name || '',
    bio: user?.bio || '',
    image: user?.avatar_url || ''
  });

  const sections = [
    { id: 'account', icon: <User size={20} />, title: 'Account Details', desc: 'Manage your profile and security' },
    { id: 'privacy', icon: <Shield size={20} />, title: 'Privacy', desc: 'Control who can see your activity' },
    { id: 'notifications', icon: <Bell size={20} />, title: 'Notifications', desc: 'Customize your alert preferences' },
    { id: 'language', icon: <Globe size={20} />, title: 'App Language', desc: 'Choose your preferred language' },
  ];

  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);

  const handleUpdate = async () => {
    try {
      const dataToSend = new FormData();
      dataToSend.append('username', formData.username);
      dataToSend.append('name', formData.name);
      dataToSend.append('bio', formData.bio);
      if (avatarFile) {
        dataToSend.append('avatar', avatarFile);
      } else {
        dataToSend.append('avatar_url', formData.image);
      }

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        body: dataToSend
      });
      const data = await response.json();
      updateProfile({
        username: data.username,
        name: data.name,
        avatar_url: data.avatar_url,
        bio: data.bio
      });
      setFormData(prev => ({ ...prev, image: data.avatar_url }));
      setAvatarFile(null);
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update profile');
    }
  };

  if (activeSection === 'account') {
    return (
      <div className="flex-1 bg-[var(--bg-app)] overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-[var(--text-muted)] mb-8 font-bold hover:text-[var(--primary)] transition-colors">
            <ChevronLeft size={20} /> Back to Settings
          </button>

          <h2 className="text-4xl font-black text-[var(--text-main)] mb-8 tracking-tight">Account Details</h2>

          <div className="glass-effect rounded-3xl p-8 border border-[var(--border)]">
            <div className="flex flex-col items-center mb-8">
              <img src={formData.image} className="w-32 h-32 rounded-huge object-cover shadow-2xl mb-4 border-4 border-white" alt="" />
              {isEditing ? (
                <div className="w-full flex justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setAvatarFile(file);
                        setFormData({ ...formData, image: URL.createObjectURL(file) });
                      }
                    }}
                    className="w-full max-w-xs bg-slate-50 border-2 border-[var(--border)] focus:border-[var(--primary-light)] rounded-xl py-2 px-4 text-xs outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[var(--primary-light)] file:text-[var(--primary)] hover:file:bg-[var(--primary)] hover:file:text-white transition-all cursor-pointer"
                  />
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="text-[var(--primary)] text-sm font-black uppercase tracking-widest">Change Avatar</button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Username</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[var(--primary-light)] rounded-2xl py-4 px-4 text-sm font-bold outline-none disabled:opacity-50 transition-all font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Display Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[var(--primary-light)] rounded-2xl py-4 px-4 text-sm font-bold outline-none disabled:opacity-50 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Bio</label>
                <textarea
                  disabled={!isEditing}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[var(--primary-light)] rounded-2xl py-4 px-4 text-sm font-bold outline-none disabled:opacity-50 transition-all resize-none h-24"
                />
              </div>

              {isEditing ? (
                <div className="flex gap-4">
                  <button onClick={handleUpdate} className="flex-1 py-4 bg-[var(--primary)] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg">Save Changes</button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-sm">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="w-full py-4 bg-[var(--primary-light)] text-[var(--primary)] rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02]">Edit Profile</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'privacy') {
    return (
      <div className="flex-1 bg-[var(--bg-app)] overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-[var(--text-muted)] mb-8 font-bold hover:text-[var(--primary)] transition-colors">
            <ChevronLeft size={20} /> Back to Settings
          </button>

          <h2 className="text-4xl font-black text-[var(--text-main)] mb-8 tracking-tight">Privacy Policy</h2>

          <div className="glass-effect rounded-3xl p-8 border border-[var(--border)] prose prose-slate max-w-none">
            <p className="font-bold text-slate-600 mb-6 leading-relaxed">
              At Bourbon Chat, your privacy is our top priority. We use end-to-end encryption for all messages and never share your data with third parties.
            </p>
            <h3 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tight">Terms and Conditions</h3>
            <ul className="space-y-4 text-sm font-bold text-slate-500 mb-8 list-disc pl-4">
              <li>Be respectful to other users in group chats.</li>
              <li>Do not share sensitive personal information.</li>
              <li>Use of AI features follows our safety guidelines.</li>
              <li>Bourbon Chat is intended for users 18 and older.</li>
            </ul>
            <div className="p-6 bg-amber-50 rounded-2xl border-2 border-amber-100">
              <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2">Notice</p>
              <p className="text-sm font-bold text-amber-600">These policies are subject to change as we evolve. Last updated: March 2026.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'notifications') {
    return (
      <div className="flex-1 bg-[var(--bg-app)] overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-[var(--text-muted)] mb-8 font-bold hover:text-[var(--primary)] transition-colors">
            <ChevronLeft size={20} /> Back to Settings
          </button>

          <h2 className="text-4xl font-black text-[var(--text-main)] mb-8 tracking-tight">Notifications</h2>

          <div className="glass-effect rounded-3xl p-8 border border-[var(--border)]">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border-2 border-[var(--border)]">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Browser Notifications</h3>
                <p className="text-sm font-medium text-slate-500">Enable alerts for new messages when Bourbon is in the background</p>
              </div>
              <button
                onClick={async () => {
                  if (!browserNotifications) {
                    if ('Notification' in window) {
                      const permission = await Notification.requestPermission();
                      if (permission === 'granted') {
                        setBrowserNotifications(true);
                        toast.success('Browser notifications enabled!');
                      } else {
                        toast.error('Notification permission denied by browser.');
                      }
                    } else {
                      toast.error('Your browser does not support notifications.');
                    }
                  } else {
                    setBrowserNotifications(false);
                    toast.info('Browser notifications disabled.');
                  }
                }}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out ${
                  browserNotifications ? 'bg-[var(--primary)]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                    browserNotifications ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[var(--bg-app)] overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-[var(--text-main)] mb-8 tracking-tight">Settings</h1>

        <div className="space-y-4">
          {sections.map((section, idx) => (
            <motion.div
              key={section.id}
              onClick={() => setActiveSection(section.id)}
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
