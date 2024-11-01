import { memo, useRef, useState, useCallback } from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "./ImageUploader";

// Constant for maximum textarea height
const MAX_TEXTAREA_HEIGHT = 200;

export const ChatInput = memo(({ onSendMessage, disabled }) => {
    const [message, setMessage] = useState("");
    const textareaRef = useRef(null);
    const isSubmitting = useRef(false);

    const resetTextarea = useCallback(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
        }
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e?.preventDefault();
        
        const trimmedMessage = message.trim();
        if (!trimmedMessage || disabled || isSubmitting.current) return;

        try {
            isSubmitting.current = true;
            setMessage("");
            // Reset textarea height after clearing
            resetTextarea();
            await onSendMessage(trimmedMessage);
        } finally {
            isSubmitting.current = false;
        }
    }, [message, disabled, onSendMessage, resetTextarea]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);

    const handleChange = useCallback((e) => {
        setMessage(e.target.value);
        // Auto-resize textarea
        resetTextarea();
    }, [resetTextarea]);

    return (
        <div className="flex-none border-t bg-background">
            <form onSubmit={handleSubmit} className="p-4">
                <div className="flex gap-2 items-end">
                    <div className="relative flex-1">
                        <Textarea
                            ref={textareaRef}
                            value={message}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="min-h-[40px] max-h-[200px] resize-none w-full pr-10"
                            autoComplete="on"
                            autoCorrect="on"
                            spellCheck="true"
                        />
                        <div className="absolute top-1/2 right-1 transform -translate-y-1/2">
                            <ImageUploader onSendMessage={onSendMessage} />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        size="icon"
                        className="rounded-full h-12 w-12"
                        disabled={disabled || !message.trim()}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label="Send message"
                    >
                        <SendHorizonal className="h-[30px] w-[30px]" />
                    </Button>
                </div>
            </form>
        </div>
    );
});