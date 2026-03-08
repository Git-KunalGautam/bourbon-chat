import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb-client";
import bcrypt from "bcryptjs";
import dbConnect from "./mongodb";
import { User } from "./models";

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(clientPromise) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    emailVerified: "googleVerified",
                };
            },
        }),
        CredentialsProvider({
            id: "credentials",
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Please enter both email and password");
                }

                await dbConnect();

                const user = await User.findOne({ email: credentials.email.toLowerCase().trim() }).select("+password");

                if (!user || !user.password) {
                    throw new Error("No user found with this email or password not set");
                }

                const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordMatch) {
                    throw new Error("Incorrect password");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    emailVerified: user.emailVerified || "credentials"
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    events: {
        async createUser({ user }) {
            try {
                await dbConnect();

                const newUsername = user.email!.split('@')[0];
                const update: any = {
                    username: newUsername,
                    isActive: 0,
                    friends: [],
                    friendRequests: [],
                    statuses: [],
                    bio: ''
                };

                // If emailVerified is passed from the provider profile (like in GoogleProvider)
                if ((user as any).emailVerified) {
                    update.emailVerified = (user as any).emailVerified;
                }

                await User.findOneAndUpdate(
                    { email: user.email },
                    { $set: update },
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
                    await dbConnect();
                    const dbUser = await User.findOne({ email: user.email });
                    if (dbUser) {
                        const update: any = {};
                        let needsUpdate = false;

                        if (!dbUser.username) {
                            update.username = user.email.split('@')[0];
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

                        // Ensure emailVerified is updated if it was a date or missing
                        if (dbUser.emailVerified instanceof Date || !dbUser.emailVerified) {
                            const newVerifiedStatus = (user as any).emailVerified;
                            if (newVerifiedStatus) {
                                update.emailVerified = newVerifiedStatus;
                                needsUpdate = true;
                            }
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
