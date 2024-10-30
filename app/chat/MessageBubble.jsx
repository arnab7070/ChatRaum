'use client';
import { memo } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MessageContent from "./MessageContent";
const colorsMap = {
  green: 'rgb(22, 163, 74)',
  purple: 'rgb(147, 51, 234)',
  yellow: 'rgb(215, 145, 0)',
  orange: 'rgb(234, 88, 12)',
  pink: 'rgb(219, 39, 119)',
  teal: 'rgb(13, 148, 136)',
};

export const MessageBubble = memo(({ message, currentUser, users }) => {
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
        <MessageContent
          message={message}
          isCurrentUser={isCurrentUser}
          backgroundColor={backgroundColor}
        />
      </div>
    </motion.div>
  );
});