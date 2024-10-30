import { memo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";

export const MessagesList = memo(({ messages, currentUser, users, scrollAreaRef }) => {
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