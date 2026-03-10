import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Missing email or password" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create username from email
        const username = normalizedEmail.split('@')[0];

        // Create new user
        const newUser = await User.create({
            name: name || "",
            email: normalizedEmail,
            password: hashedPassword,
            username,
            emailVerified: "credentials",
            isActive: 0,
            friends: [],
            friendRequests: [],
            statuses: [],
            bio: ""
        });

        return NextResponse.json(
            { message: "Account created successfully", userId: newUser._id },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
