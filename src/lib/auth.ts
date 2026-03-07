import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb-client";

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(clientPromise) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    events: {
        async createUser({ user }) {
            try {
                const { User } = await import("./models");
                const { default: dbConnect } = await import("./mongodb");
                await dbConnect();

                const newUsername = user.email!.split('@')[0] + Math.floor(Math.random() * 1000);
                await User.findOneAndUpdate(
                    { email: user.email },
                    {
                        $set: {
                            username: newUsername,
                            isActive: 0,
                            friends: [],
                            friendRequests: [],
                            statuses: [],
                            bio: ''
                        }
                    },
                    { new: true }
                );
            } catch (error) {
                console.error("Error in createUser event:", error);
            }
        }
    },
    callbacks: {
        async signIn({ user }) {
            if (user?.email) {
                try {
                    const { User } = await import("./models");
                    const { default: dbConnect } = await import("./mongodb");
                    await dbConnect();

                    const dbUser = await User.findOne({ email: user.email });
                    if (dbUser) {
                        const update: any = {};
                        let needsUpdate = false;

                        if (!dbUser.username) {
                            update.username = user.email.split('@')[0] + Math.floor(Math.random() * 1000);
                            needsUpdate = true;
                        }
                        if (dbUser.isActive === undefined) {
                            update.isActive = 0;
                            needsUpdate = true;
                        }
                        if (!dbUser.friends) {
                            update.friends = [];
                            needsUpdate = true;
                        }
                        if (!dbUser.friendRequests) {
                            update.friendRequests = [];
                            needsUpdate = true;
                        }
                        if (!dbUser.statuses) {
                            update.statuses = [];
                            needsUpdate = true;
                        }
                        if (dbUser.bio === undefined) {
                            update.bio = '';
                            needsUpdate = true;
                        }

                        if (needsUpdate) {
                            await User.updateOne({ email: user.email }, { $set: update });
                        }
                    }
                } catch (error) {
                    console.error("Error in signIn callback:", error);
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        },
    },
};
