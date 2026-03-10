import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
import path from "path";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "./src/lib/mongodb";
import { User, Message, Conversation, MessageSchemaZod } from "./src/lib/models";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Ensure media directory exists
const mediaDir = path.join(process.cwd(), "public", "media");
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

async function startServer() {
  await app.prepare();
  try {
    await connectDB();
    console.log("✓ MongoDB connection established successfully.");
  } catch (error) {
    console.error("✗ Failed to connect to MongoDB during server startup.");
    console.error(error);
  }

  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // server.use(express.json()); // Removed to fix "Response body object should not be disturbed or locked" error in Next.js
  server.use("/media", express.static(mediaDir));

  // Socket.io Logic
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("send_message", async (data) => {
      // Validate with Zod
      try {
        const validatedData = MessageSchemaZod.parse(data);

        // Save message to MongoDB
        const newMessage = new Message({
          conversation_id: validatedData.conversation_id,
          sender_id: validatedData.sender_id,
          content: validatedData.content,
          type: validatedData.type || 'text',
        });
        await newMessage.save();

        // Update conversation last message
        await Conversation.findByIdAndUpdate(validatedData.conversation_id, {
          last_message: validatedData.content,
          last_message_at: new Date(),
        });

        io.to(validatedData.conversation_id).emit("receive_message", {
          ...validatedData,
          id: newMessage._id,
          created_at: newMessage.createdAt,
          tempId: validatedData.tempId,
        });
      } catch (error) {
        console.error("Validation or Save error:", error);
      }
    });

    socket.on("typing", (data) => socket.to(data.conversationId).emit("user_typing", data));
    socket.on("stop_typing", (data) => socket.to(data.conversationId).emit("user_stop_typing", data));

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Next.js handler
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
