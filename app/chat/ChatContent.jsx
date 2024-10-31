'use client';
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../../firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, onSnapshot, serverTimestamp, orderBy, query, updateDoc, doc, setDoc } from "firebase/firestore";
import CryptoJS from "crypto-js";
import { Card } from "@/components/ui/card";
import { ChatHeader } from "./ChatHeader";
import { MessagesList } from "./MessagesList";
import { ChatInput } from "./ChatInput";

export const ChatContent = () => {
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState({});
    const [isSending, setIsSending] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const scrollAreaRef = useRef(null);
    const presenceIntervalRef = useRef(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const roomCode = searchParams.get("roomCode");
    const [secretKey, setSecretKey] = useState(null);
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

        setDoc(userDocRef, userData, { merge: true })
            .then(() => {
                presenceIntervalRef.current = setInterval(async () => {
                    try {
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
            updateDoc(userDocRef, {
                lastSeen: serverTimestamp()
            }).catch((error) => {
                console.log("Error updating last seen on unmount:", error);
            });
        };
    }, [roomCode, router]);

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
                    const decryptedMessage = CryptoJS.AES.decrypt(data.text, data.userId).toString(CryptoJS.enc.Utf8);
                    return { id: doc.id, ...data, text: decryptedMessage };
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
        setIsDeleting(true);
        try {
            const messagesQuerySnapshot = await getDocs(collection(db, `chatRooms/${roomCode}/messages`));
            await Promise.all(messagesQuerySnapshot.docs.map(async (messageDoc) => {
                await deleteDoc(messageDoc.ref);
            }));

            const usersQuerySnapshot = await getDocs(collection(db, `chatRooms/${roomCode}/users`));
            await Promise.all(usersQuerySnapshot.docs.map(async (userDoc) => {
                await deleteDoc(userDoc.ref);
            }));

            await deleteDoc(doc(db, "chatRooms", roomCode));
            router.push('/');
        } catch (error) {
            console.error("Error deleting room:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="sm:h-[90vh] md:h-screen flex items-center justify-center lg:p-4 md:p-0">
            <Card className="flex-1 flex flex-col relative h-screen max-w-4xl">
                <ChatHeader
                    roomCode={roomCode}
                    users={users}
                    onDeleteRoom={handleDeleteRoom}
                    isDeleting={isDeleting}
                />

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
