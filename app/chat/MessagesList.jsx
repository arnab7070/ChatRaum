import { memo, useState, useCallback, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";

export const MessagesList = memo(
  ({ messages, currentUser, users, scrollAreaRef }) => {
    // Handle both array and object formats for users
    const usersMap = useMemo(() => {
      if (!users) return {};
      // If users is already an object, use it directly
      if (!Array.isArray(users)) return users;
      // If users is an array, convert to object
      return Object.fromEntries(users.map(user => [user.id, user]));
    }, [users]);

    // Memoize message rendering function
    const renderMessage = useCallback((msg) => (
      <MessageBubble
        key={msg.id}
        message={msg}
        currentUser={currentUser}
        users={usersMap}
      />
    ), [currentUser, usersMap]);

    // Only re-render messages that have changed
    const messageElements = useMemo(
      () => messages?.map(renderMessage) ?? [],
      [messages, renderMessage]
    );

    return (
      <ScrollArea 
        ref={scrollAreaRef} 
        className="flex-1 p-4"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {messageElements}
        </AnimatePresence>
      </ScrollArea>
    );
  },
  // Custom comparison function for memo
  (prevProps, nextProps) => {
    return (
      prevProps.currentUser?.id === nextProps.currentUser?.id &&
      prevProps.messages === nextProps.messages &&
      prevProps.users === nextProps.users
    );
  }
);