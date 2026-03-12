import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

// Zod Schemas for validation
export const UserSchemaZod = z.object({
    name: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6).optional(),
    image: z.string().optional(),
    username: z.string().optional(),
    bio: z.string().optional(),
    isActive: z.number().default(0),
    emailVerified: z.union([z.date(), z.string()]).optional(),
});

export const MessageSchemaZod = z.object({
    conversation_id: z.string(),
    sender_id: z.string(),
    content: z.string(),
    type: z.enum(['text', 'image', 'video']).default('text'),
    timestamp: z.date().default(() => new Date()),
    tempId: z.string().optional(),
});

export const ConversationSchemaZod = z.object({
    participants: z.array(z.string()), // User IDs
    last_message: z.string().optional(),
    last_message_at: z.date().optional(),
    isGroup: z.boolean().default(false),
    name: z.string().optional(),
});

// Types
export type UserType = z.infer<typeof UserSchemaZod>;
export type MessageType = z.infer<typeof MessageSchemaZod>;
export type ConversationType = z.infer<typeof ConversationSchemaZod>;

// Mongoose Schemas
const UserSchema = new Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, select: false },
    image: String,
    username: { type: String, unique: true, sparse: true },
    bio: String,
    isActive: { type: Number, default: 0 },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{
        from: { type: Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        createdAt: { type: Date, default: Date.now }
    }],
    statuses: [{
        content: String,
        mediaUrl: String,
        mediaType: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
    }],
    emailVerified: Schema.Types.Mixed,
}, { timestamps: true });

const MessageSchema = new Schema({
    conversation_id: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
}, { timestamps: true });

const ConversationSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    last_message: String,
    last_message_at: Date,
    isGroup: { type: Boolean, default: false },
    name: String,
}, { timestamps: true });

// Models
// Mongoose will automatically create collections if they don't exist
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
