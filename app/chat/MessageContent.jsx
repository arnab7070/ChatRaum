import { useState } from 'react';
import MessageStatus from "./MessageStatus";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

const isImageUrl = (url) => {
  return (
    /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url) ||
    url.includes("firebasestorage.googleapis.com")
  );
};

const MessageContent = ({ message, isCurrentUser, backgroundColor }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`px-4 py-2 rounded-2xl max-w-md break-words ${isCurrentUser ? 'text-white rounded-br-sm' : 'text-white rounded-bl-sm'}`}
        style={isImageUrl(message.text) ? undefined : !isCurrentUser ? { backgroundColor } : { backgroundColor: '#2563eb' }}
      >
        {isImageUrl(message.text) ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div className="relative w-full max-w-full rounded-lg overflow-hidden shadow-lg cursor-pointer">
                <img
                  src={message.text}
                  alt="Uploaded image"
                  className="object-cover w-full h-64 transition-transform duration-300 ease-in-out transform hover:scale-105"
                  style={{ borderRadius: '0.75rem' }}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[50%] max-h-[90%] w-5/6 flex items-center justify-center p-1 bg-white">
              <DialogTitle className="sr-only">Image Preview</DialogTitle>
              <img
                src={message.text}
                alt="Full screen image"
                className="max-w-full max-h-full object-cover rounded-md"
              />
            </DialogContent>
          </Dialog>
        ) : (
          <span>{message.text}</span>
        )}
      </div>
      <MessageStatus message={message} isCurrentUser={isCurrentUser} />
    </div>
  );
};

export default MessageContent;