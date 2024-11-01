'use client'
import { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { db } from '@/firebaseConfig';

export const useMessageSender = (roomCode, currentUser) => {
    const [isSending, setIsSending] = useState(false);
    const secretKeyRef = useRef(null);
    useEffect(() => {
        // Set the secret key when currentUser changes
        if (currentUser?.userId) {
            secretKeyRef.current = currentUser.userId;
        }
    }, [currentUser]);

    // Memoize the collection reference
    const messagesCollectionRef = useMemo(() => {
        if (!roomCode) return null;
        return collection(db, `chatRooms/${roomCode}/messages`);
    }, [roomCode]);

    // Memoize the message payload creator
    const createMessagePayload = useCallback((messageText, encryptedMessage) => ({
        text: encryptedMessage,
        timestamp: serverTimestamp(),
        userId: currentUser?.userId,
        username: currentUser?.username,
        read: false
    }), [currentUser?.userId, currentUser?.username]);

    // Memoize the encryption function
    const encryptMessage = useCallback((messageText) => {
        if (!secretKeyRef.current) return null;
        return CryptoJS.AES.encrypt(messageText, secretKeyRef.current).toString();
    }, []);

    // Memoize the main send message function
    const sendMessage = useCallback(async (messageText) => {
        if (!roomCode || !currentUser || !messagesCollectionRef || isSending) {
            console.log('[Warning] Message sending preconditions not met');
            return;
        }

        setIsSending(true);
        console.log('[Performance] Sending new message');

        try {
            const encryptedMessage = encryptMessage(messageText);
            if (!encryptedMessage) {
                throw new Error('Message encryption failed');
            }

            const messagePayload = createMessagePayload(messageText, encryptedMessage);
            await addDoc(messagesCollectionRef, messagePayload);
            
            console.log('[Success] Message sent successfully');
        } catch (error) {
            console.error("[Error] Sending message:", error);
            throw error; // Allow the component to handle the error
        } finally {
            setIsSending(false);
        }
    }, [
        roomCode,
        currentUser,
        messagesCollectionRef,
        isSending,
        encryptMessage,
        createMessagePayload
    ]);

    return {
        sendMessage,
        isSending
    };
};