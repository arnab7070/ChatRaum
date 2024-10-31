'use client'
import { memo, useRef, useState, useCallback } from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const ChatInput = memo(({ onSendMessage, disabled }) => {
    const [message, setMessage] = useState("");
    const inputRef = useRef(null);
    const isSubmitting = useRef(false);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (message.trim() && !disabled && !isSubmitting.current) {
            try {
                isSubmitting.current = true;
                const messageToSend = message.trim();
                setMessage("");
                await onSendMessage(messageToSend);
            } finally {
                isSubmitting.current = false;
            }
        }
    }, [message, disabled, onSendMessage]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    const handleChange = useCallback((e) => {
        const textarea = e.target;
        setMessage(textarea.value);
        
        // Auto-resize textarea
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }, []);

    return (
        <div className="flex-none border-t bg-background">
            <form onSubmit={handleSubmit} className="p-4">
                <div className="flex gap-2">
                    <Textarea
                        ref={inputRef}
                        value={message}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 min-h-[40px] max-h-[200px] resize-none"
                        autoComplete="on"
                        autoCorrect="on"
                        spellCheck="true"
                    />
                    <div className="flex items-end">
                        <Button
                            type="submit"
                            size="icon"
                            className="rounded-full h-12 w-12 flex-shrink-0"
                            disabled={disabled || !message.trim()}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <SendHorizonal className="h-[30px] w-[30px]" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.disabled === nextProps.disabled;
});