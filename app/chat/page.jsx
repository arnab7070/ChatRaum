'use client';
import React, { useEffect, useState, useRef, Suspense, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../../firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, onSnapshot, serverTimestamp, orderBy, query, updateDoc, doc, setDoc } from "firebase/firestore";
import { Send, Check, CheckCheck, Users, Trash, Hourglass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CryptoJS from "crypto-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/toggle-theme";

// Memoized Message Bubble Component
const MessageBubble = memo(({ message, currentUser, users }) => {
  const colorsMap = {
    green: 'rgb(22, 163, 74)',    // Tailwind bg-green-600
    purple: 'rgb(147, 51, 234)',  // Tailwind bg-purple-600
    yellow: 'rgb(215, 145, 0)',   // Tailwind bg-yellow-600
    orange: 'rgb(234, 88, 12)',   // Tailwind bg-orange-600
    pink: 'rgb(219, 39, 119)',    // Tailwind bg-pink-600
    teal: 'rgb(13, 148, 136)',    // Tailwind bg-teal-600
  };
  const isCurrentUser = message.userId === currentUser?.userId;
  const sender = users[message.userId] || { username: 'Unknown User' };
  const backgroundColor = colorsMap[sender.color] || 'gray';

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
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1">{sender.username}</span>
          </div>
        )}
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div
            style={!isCurrentUser ? { backgroundColor } : undefined}
            className={`px-4 py-2 rounded-2xl max-w-md break-words ${isCurrentUser ? 'bg-blue-600 text-white rounded-br-sm' : 'text-white rounded-bl-sm'
              }`}
          >
            {message.text}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-300">
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
            autoComplete="on"
            autoCorrect="on"
            spellCheck="true"
          // disabled={disabled}
          />
          <Button
            type="submit"
            size="icon"
            className="w-20 h-10"
            disabled={disabled || !message}
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

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

    // Set initial user data (will create the document if it doesn't exist)
    setDoc(userDocRef, userData, { merge: true })
      .then(() => {
        // Start presence updates AFTER initial setDoc 
        presenceIntervalRef.current = setInterval(async () => {
          try {
            // Update presence (no need to check if it exists)
            await updateDoc(userDocRef, {
              lastSeen: serverTimestamp()
            });
          } catch (error) {
            router.replace('/');
            console.log("Error updating presence:", error);
          }
        }, 5000);
      })
      .catch((error) => {
        console.log("Error setting initial user data:", error);
      });

    return () => {
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current);
      }
      // Update last seen one last time on unmount
      updateDoc(userDocRef, {
        lastSeen: serverTimestamp()
      }).catch((error) => {
        console.log("Error updating last seen on unmount:", error);
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

  const handleDeleteRoom = async () => {
    setOpenDialog(false);
    setIsDeleting(true);

    try {
      // 1. Delete Messages (using Promise.all for efficiency)
      const messagesQuerySnapshot = await getDocs(collection(db, `chatRooms/${roomCode}/messages`));
      await Promise.all(messagesQuerySnapshot.docs.map(async (messageDoc) => {
        await deleteDoc(messageDoc.ref);
      }));

      // 2. Delete Users (using Promise.all for efficiency)
      const usersQuerySnapshot = await getDocs(collection(db, `chatRooms/${roomCode}/users`));
      await Promise.all(usersQuerySnapshot.docs.map(async (userDoc) => {
        await deleteDoc(userDoc.ref);
      }));

      // 3. Delete the Room Document 
      await deleteDoc(doc(db, "chatRooms", roomCode));

      // Navigate to the home page
      router.push('/');

    } catch (error) {
      console.error("Error deleting room:", error);
      // Handle error, perhaps show a user-friendly message
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="h-screen flex items-center justify-center lg:p-4 md:p-0">
      <Card className="flex-1 flex flex-col relative h-full max-w-4xl">
        <div className="sticky top-0 z-10 bg-white dark:bg-black border-b">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Chat Room: {roomCode}</h3>
            <div className="flex flex-row-reverse gap-x-2">
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
                  {/* Delete Room Button */}
                  <Separator className="mt-5" />
                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="lg"
                        className="mt-6 w-full"
                        disabled={isDeleting}
                      >
                        {/* {isDeleting && <span className="mr-2">Deleting...</span>} */}
                        {isDeleting ? <Hourglass className="w-4 h-4 mr-2" /> : <Trash className="w-4 h-4 mr-2" />}
                        {isDeleting ? 'Deleting...' : 'Delete Room'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-11/12">
                      <DialogHeader>
                        <DialogTitle>Delete Room</DialogTitle>
                      </DialogHeader>
                      <p>Are you sure you want to delete this room? This action cannot be undone.</p>
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteRoom}
                          disabled={isDeleting} // Disable if deleting
                        >
                          {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </SheetContent>
              </Sheet>
              <ModeToggle />
            </div>
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