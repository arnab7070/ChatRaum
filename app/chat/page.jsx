'use client';
import React, { useEffect, useState, useRef, Suspense, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../../firebaseConfig";
import { collection, addDoc, getDocs, onSnapshot, serverTimestamp, orderBy, query, updateDoc, doc, setDoc } from "firebase/firestore";
import { Send, Check, CheckCheck, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CryptoJS from "crypto-js";

// Memoized Message Bubble Component
const MessageBubble = memo(({ message, currentUser, users }) => {
  const isCurrentUser = message.userId === currentUser?.userId;
  const sender = users[message.userId] || { username: 'Unknown User' };

  const bubbleVariants = {
    initial: {
      opacity: 0,
      x: isCurrentUser ? 20 : -20,
      scale: 0.9
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      variants={bubbleVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className="flex items-end gap-2">
        {!isCurrentUser && (
          <div className="flex flex-col items-center">
            <Avatar className="w-8 h-8">
              <AvatarImage src={sender.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.userId}`} />
              <AvatarFallback>{sender.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500 mt-1">{sender.username}</span>
          </div>
        )}
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-2 rounded-2xl max-w-md break-words ${isCurrentUser
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
          >
            {message.text}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {isCurrentUser && (
              <span className="ml-1">
                {message.read ? (
                  <CheckCheck className="w-4 h-4 text-blue-500" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Memoized Messages List Component
const MessagesList = memo(({ messages, currentUser, users, scrollAreaRef }) => {
  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            currentUser={currentUser}
            users={users}
          />
        ))}
      </AnimatePresence>
    </ScrollArea>
  );
});

// UsersList component
const UsersList = ({ users }) => {
  const getPresenceStatus = (lastSeen) => {
    if (!lastSeen) return 'Offline';
    const lastSeenDate = lastSeen.toDate();
    const timeDiff = new Date().getTime() - lastSeenDate.getTime();
    if (timeDiff < 30000) return 'Online';
    if (timeDiff < 300000) return 'Away';
    return 'Offline';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Online': return 'text-green-500';
      case 'Away': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(users).map(([userId, user]) => {
        const status = getPresenceStatus(user.lastSeen);
        const statusColor = getStatusColor(status);
        return (
          <div key={userId} className="flex items-center gap-3">
            <div className="relative inline-block">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span
                className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white"
                style={{
                  backgroundColor: statusColor.includes('green') ? 'rgb(34, 197, 94)' :
                    statusColor.includes('yellow') ? 'rgb(234, 203, 40)' :
                      statusColor.includes('red') ? 'rgb(239, 68, 68)' : 'gray'
                }}
              />
            </div>
            <div>
              <p className="text-sm font-medium">{user.username}</p>
              <p className={`text-xs ${statusColor}`}>{status}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ChatInput = memo(({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);
  const focusTimeout = useRef(null);

  const maintainFocus = () => {
    if (focusTimeout.current) {
      clearTimeout(focusTimeout.current);
    }
    focusTimeout.current = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  useEffect(() => {
    maintainFocus();
    return () => {
      if (focusTimeout.current) {
        clearTimeout(focusTimeout.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      const messageToSend = message.trim();
      setMessage("");
      await onSendMessage(messageToSend);
      maintainFocus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-none border-t bg-background">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onBlur={maintainFocus}
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            autoCorrect="on"
            spellCheck="false"
          // disabled={disabled}
          />
          <Button
            type="submit"
            size="icon"
            className="w-20 h-10"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss on button click
          >
            Send<Send className="w-6 h-6" />
          </Button>
        </div>
      </form>
    </div>
  );
});




// Main Chat Content Component
const ChatContent = () => {
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef(null);
  const presenceIntervalRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomCode = searchParams.get("roomCode");
  const [secretKey, setSecretKey] = useState(null); // State to hold the secret key

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]); // This will trigger when messages are first loaded

  useEffect(() => {
    const userId = localStorage.getItem('chatUserId');
    const username = localStorage.getItem('chatUsername');


    if (!userId || !username || !roomCode) {
      router.push('/');
      return;
    }

    setSecretKey(userId);

    const userData = {
      userId,
      username,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      lastSeen: serverTimestamp()
    };

    setCurrentUser(userData);

    const userDocRef = doc(db, `chatRooms/${roomCode}/users`, userId);
    setDoc(userDocRef, userData, { merge: true });

    presenceIntervalRef.current = setInterval(async () => {
      try {
        await updateDoc(userDocRef, {
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.error("Error updating presence:", error);
      }
    }, 25000);

    return () => {
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current);
      }
      updateDoc(userDocRef, {
        lastSeen: serverTimestamp()
      });
    };
  }, [roomCode]);

  useEffect(() => {
    if (roomCode && currentUser) {
      const messagesQuery = query(
        collection(db, `chatRooms/${roomCode}/messages`),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const liveMessages = snapshot.docs.map((doc) => {
          const data = doc.data();
          if (data.userId !== currentUser.userId && !data.read) {
            updateDoc(doc.ref, { read: true });
          }
          // Decrypt the message
          const decryptedMessage = CryptoJS.AES.decrypt(data.text, data.userId).toString(CryptoJS.enc.Utf8);
          return { id: doc.id, ...data, text: decryptedMessage }; // Use the decrypted message
        });
        setMessages(liveMessages);
        scrollToBottom();
      });

      const usersRef = collection(db, `chatRooms/${roomCode}/users`);
      const usersUnsubscribe = onSnapshot(usersRef, (snapshot) => {
        const usersData = {};
        snapshot.docs.forEach((doc) => {
          usersData[doc.id] = doc.data();
        });
        setUsers(usersData);
      });

      return () => {
        unsubscribe();
        usersUnsubscribe();
      };
    }
  }, [roomCode, currentUser]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!roomCode || !currentUser || isSending) return;

    setIsSending(true);
    const encryptedMessage = CryptoJS.AES.encrypt(messageText, secretKey).toString();
    try {
      await addDoc(collection(db, `chatRooms/${roomCode}/messages`), {
        text: encryptedMessage,
        timestamp: serverTimestamp(),
        userId: currentUser.userId,
        username: currentUser.username,
        read: false
      });
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="h-screen flex">
      <Card className="flex-1 flex flex-col relative h-full max-w-4xl">
        <div className="sticky top-0 z-10 bg-white border-b">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Chat Room: {roomCode}</h3>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Users className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Room Participants</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <UsersList users={users} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <MessagesList
          messages={messages}
          currentUser={currentUser}
          users={users}
          scrollAreaRef={scrollAreaRef}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isSending}
        />
      </Card>
    </div>
  );
};

export default function ChatRoom() {
  return (
    <Suspense fallback={<div>Loading chat room...</div>}>
      <ChatContent />
    </Suspense>
  );
}