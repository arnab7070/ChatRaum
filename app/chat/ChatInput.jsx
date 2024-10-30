'use client'
import { memo, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"


export const ChatInput = memo(({ onSendMessage, disabled }) => {
    const [message, setMessage] = useState("");
    const inputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            const messageToSend = message.trim();
            setMessage("");
            await onSendMessage(messageToSend);
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
                    <Textarea
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1"
                        autoComplete="on"
                        autoCorrect="on"
                        spellCheck="true"
                    />
                    <div className="flex items-end">
                        <Button
                            type="submit"
                            size="icon"
                            className="rounded-full ml-2 px-4 py-2 h-[90%] w-[90%]"
                            disabled={disabled || !message}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <SendHorizonal style={{ width: '30px', height: '30px' }} />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
});