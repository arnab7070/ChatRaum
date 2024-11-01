import { Check, CheckCheck } from "lucide-react";

const MessageStatus = ({ message, isCurrentUser }) => (
    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-300">
        {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
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
);

export default MessageStatus;