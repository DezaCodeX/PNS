import { SendHorizontal, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./chatbot.css";

type ChatMessage = {
  id: number;
  sender: "user" | "assistant";
  text: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "assistant",
    text: "Welcome to Hotel PNS Nakshatra.\nHow can I assist you today?",
  },
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [hasInteracted, setHasInteracted] = useState(false);
  const autoMinimizeRef = useRef<number | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = messageListRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (hasInteracted) return;

    autoMinimizeRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 3000);

    return () => {
      if (autoMinimizeRef.current) {
        window.clearTimeout(autoMinimizeRef.current);
      }
    };
  }, [isOpen, hasInteracted]);

  const handleClose = () => {
    setIsOpen(false);
    setHasInteracted(true);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasInteracted(true);
  };

  const handleSendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInputValue("");
    setHasInteracted(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "assistant",
          text: "Thank you for contacting Hotel PNS Nakshatra. How can I help you with rooms, dining, reservations, or hotel facilities?",
        },
      ]);
    }, 300);
  };

  return (
    <div className="chatbot-shell">
      {isOpen ? (
        <div
          className={`chatbot-window ${isOpen ? "is-opening" : "is-minimized"}`}
          role="dialog"
          aria-modal="false"
          aria-label="Nakshatra Assistant chat"
        >
          <div className="chatbot-header">
            <div className="chatbot-brand">
              <span className="chatbot-brand-badge" aria-hidden="true">
                <Star className="size-3.5 fill-current" />
              </span>
              <p className="chatbot-title">Nakshatra Assistant</p>
            </div>

            <button
              type="button"
              aria-label="Close chatbot"
              className="chatbot-close"
              onClick={handleClose}
            >
              <X className="size-4" />
            </button>
          </div>

          <div ref={messageListRef} className="chatbot-messages" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`chatbot-message ${message.sender}`}>
                <div className="chatbot-bubble">{message.text}</div>
              </div>
            ))}
          </div>

          <form
            className="chatbot-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              aria-label="Type your message"
              className="chatbot-input"
              placeholder="Type your message..."
              value={inputValue}
              onFocus={() => setHasInteracted(true)}
              onChange={(event) => setInputValue(event.target.value)}
            />

            <button type="submit" aria-label="Send message" className="chatbot-send">
              <SendHorizontal className="size-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          aria-label="Open chatbot"
          className="chatbot-toggle"
          onClick={handleOpen}
          title="Open chatbot"
        >
          <Star className="chatbot-star fill-current" />
        </button>
      )}
    </div>
  );
}
