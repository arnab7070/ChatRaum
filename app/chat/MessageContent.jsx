import MessageStatus from "./MessageStatus";
const MessageContent = ({ message, isCurrentUser, backgroundColor }) => (
    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div
            style={!isCurrentUser ? { backgroundColor } : undefined}
            className={`px-4 py-2 rounded-2xl max-w-md break-words ${isCurrentUser ? 'bg-blue-600 text-white rounded-br-sm' : 'text-white rounded-bl-sm'
                }`}
        >
            {message.text}
        </div>
        <MessageStatus message={message} isCurrentUser={isCurrentUser} />
    </div>
);

export default MessageContent;