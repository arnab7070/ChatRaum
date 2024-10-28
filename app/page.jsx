'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../firebaseConfig";
import { getDoc, doc, setDoc, onSnapshot, serverTimestamp, orderBy, query } from "firebase/firestore";
import { motion } from "framer-motion";
import { Users, MessageSquare, UserPlus, LogIn } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Generate a random color for user
const getRandomColor = () => {
  const colors = ['red', 'blue', 'green', 'purple', 'orange', 'pink', 'teal'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const router = useRouter();

  // Check for existing user data in localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const generateRoomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const saveUserData = async (roomCode) => {
    if (!username) {
      setError("Please enter a username");
      return false;
    }

    const savedUserId = localStorage.getItem('chatUserId');
    const userId = savedUserId || Math.random().toString(36).substr(2, 9);
    if (!savedUserId) {
      localStorage.setItem('chatUserId', userId);
    }
    const userColor = getRandomColor();

    const userData = {
      username,
      userId,
      color: userColor,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      lastSeen: serverTimestamp()
    };

    // Save to localStorage
    localStorage.setItem('chatUsername', username);
    localStorage.setItem('chatUserColor', userColor);

    // Save to Firestore
    await setDoc(doc(db, `chatRooms/${roomCode}/users`, userId), userData);

    return true;
  };

  const createRoom = async () => {
    const newRoomCode = generateRoomCode();
    if (await saveUserData(newRoomCode)) {
      // Create room document
      await setDoc(doc(db, 'chatRooms', newRoomCode), {
        createdAt: serverTimestamp(),
        createdBy: username
      });

      router.push(`/chat?roomCode=${newRoomCode}`);
    }
  };

  const joinRoom = async () => {
    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    // Check if room exists
    const roomRef = doc(db, 'chatRooms', roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      setError("Room not found");
      setIsJoinDialogOpen(false);
      return;
    }

    if (await saveUserData(roomCode)) {
      router.push(`/chat?roomCode=${roomCode}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Welcome to ChatRoom
            </CardTitle>
            <CardDescription className="text-center">
              Create or join a room to start chatting
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-medium">Your Name</label>
              <div className="flex gap-2">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  className="flex-1"
                />
                {username && (
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} />
                    <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <Button
                onClick={() => setIsJoinDialogOpen(true)}
                variant="outline"
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                Join Existing Room
              </Button>

              <Button
                onClick={createRoom}
                className="w-full"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create New Room
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogContent className="top-center-dialog">
            <DialogHeader>
              <DialogTitle>Join Chat Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Room Code</label>
                <Input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="Enter 6-digit room code"
                  maxLength={6}
                  inputMode="numeric"
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button onClick={joinRoom} className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                Join Room
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}