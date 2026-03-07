import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MdClose } from 'react-icons/md';

interface Props {
  status: any;
  onClose: () => void;
}

export const StatusViewer = ({ status, onClose }: Props) => {
  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white text-4xl z-[110] hover:scale-110 transition-transform"
          >
            <MdClose />
          </button>

          <div className="relative w-full max-w-lg aspect-[9/16] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl">
            <motion.div 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="absolute inset-0"
            >
              <img 
                src={status.img} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/60 to-transparent flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                <img src={status.img} className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-bold">{status.user}</span>
            </div>

            <div className="absolute bottom-10 inset-x-0 text-center px-6">
              <p className="text-white text-lg font-medium drop-shadow-md">
                Checking out this amazing view! ✨
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
