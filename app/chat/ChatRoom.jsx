'use client';
import { Suspense } from "react";
import { ChatContent } from "./ChatContent";

export default function ChatRoom() {
    return (
        <Suspense fallback={<div>Loading chat room...</div>}>
            <ChatContent />
        </Suspense>
    );
}