import mongoose, { Schema } from 'mongoose';
import { z } from 'zod';

// Zod Schemas for validation
export const UserSchemaZod = z.object({
    name: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6).optional(),
    username: z.string().optional(),
    bio: z.string().optional(),
    profile_picture: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    isActive: z.number().default(1),
    is_online: z.boolean().default(false),
    last_seen: z.union([z.date(), z.string()]).optional(),
    emailVerified: z.string().optional(),
    friends: z.array(z.string()).default([]),
    friendRequests: z.array(z.any()).default([]),
});

export const ChatSchemaZod = z.object({
    chat_type: z.enum(['private', 'group']).default('private'),
    chat_name: z.string().optional().nullable(),
    created_by: z.string().optional(),
    last_message: z.string().optional().nullable(),
    last_message_at: z.date().optional().nullable(),
});

export const MessageSchemaZod = z.object({
    chat_id: z.string(),
    sender_id: z.string(),
    message_text: z.string(),
    message_type: z.enum(['text', 'image', 'video', 'file']).default('text'),
    attachment_url: z.string().optional().nullable(),
    is_edited: z.boolean().default(false),
    tempId: z.string().optional(), // For frontend optimistic updates
});

// Update types
export type UserType = z.infer<typeof UserSchemaZod>;
export type ChatType = z.infer<typeof ChatSchemaZod>;
export type MessageType = z.infer<typeof MessageSchemaZod>;

// Mongoose Schemas
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, default: null },
    password: { type: String, select: false },
    username: { type: String, unique: true, sparse: true },
    bio: { type: String, default: "" },
    profile_picture: { type: String, default: null },
    is_online: { type: Boolean, default: false },
    last_seen: { type: Date, default: Date.now },
    isActive: { type: Number, default: 1 },
    emailVerified: { type: String, default: "credentials" },
    friends: [{ type: Schema.Types.ObjectId, ref: 'tblusers' }],
    friendRequests: [{
        from: { type: Schema.Types.ObjectId, ref: 'tblusers' },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        createdAt: { type: Date, default: Date.now }
    }],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'tblusers' });

const ChatSchema = new Schema({
    chat_type: { type: String, enum: ['private', 'group'], default: 'private' },
    chat_name: { type: String, default: null },
    created_by: { type: Schema.Types.ObjectId, ref: 'tblusers' },
    last_message: { type: String, default: null },
    last_message_at: { type: Date, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'tblchats' });

const ChatParticipantSchema = new Schema({
    chat_id: { type: Schema.Types.ObjectId, ref: 'tblchats', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'tblusers', required: true },
    role: { type: String, enum: ['member', 'admin'], default: 'member' },
    joined_at: { type: Date, default: Date.now }
}, { collection: 'tblchat_participants' });

const MessageSchema = new Schema({
    chat_id: { type: Schema.Types.ObjectId, ref: 'tblchats', required: true },
    sender_id: { type: Schema.Types.ObjectId, ref: 'tblusers', required: true },
    message_type: { type: String, enum: ['text', 'image', 'video', 'file'], default: 'text' },
    message_text: { type: String, required: true },
    attachment_url: { type: String, default: null },
    is_edited: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'tblmessages' });

const MessageStatusSchema = new Schema({
    message_id: { type: Schema.Types.ObjectId, ref: 'tblmessages', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'tblusers', required: true },
    status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
    updated_at: { type: Date, default: Date.now }
}, { collection: 'tblmessage_status' });

const AttachmentSchema = new Schema({
    message_id: { type: Schema.Types.ObjectId, ref: 'tblmessages' },
    file_url: { type: String },
    file_type: { type: String },
    file_size: { type: Number }
}, { collection: 'tblattachments' });

const StatusSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'tblusers', required: true },
    media_url: { type: String, required: true },
    media_type: { type: String, enum: ['image', 'video'], required: true },
    caption: { type: String, default: "" },
    created_at: { type: Date, default: Date.now },
    expires_at: { type: Date, required: true }
}, { collection: 'tblstatuses' });

const StatusViewSchema = new Schema({
    status_id: { type: Schema.Types.ObjectId, ref: 'tblstatuses', required: true },
    viewer_id: { type: Schema.Types.ObjectId, ref: 'tblusers', required: true },
    viewed_at: { type: Date, default: Date.now }
}, { collection: 'tblstatus_views' });

// Models
export const User = mongoose.models.tblusers || mongoose.model('tblusers', UserSchema);
export const Chat = mongoose.models.tblchats || mongoose.model('tblchats', ChatSchema);
export const ChatParticipant = mongoose.models.tblchat_participants || mongoose.model('tblchat_participants', ChatParticipantSchema);
export const Message = mongoose.models.tblmessages || mongoose.model('tblmessages', MessageSchema);
export const MessageStatus = mongoose.models.tblmessage_status || mongoose.model('tblmessage_status', MessageStatusSchema);
export const Attachment = mongoose.models.tblattachments || mongoose.model('tblattachments', AttachmentSchema);
export const Status = mongoose.models.tblstatuses || mongoose.model('tblstatuses', StatusSchema);
export const StatusView = mongoose.models.tblstatus_views || mongoose.model('tblstatus_views', StatusViewSchema);

// Export old names for compatibility during transition if needed, but better to update everything.
// export const Conversation = Chat; 
