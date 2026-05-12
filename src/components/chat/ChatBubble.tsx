import * as React from "react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
}

export function ChatBubble({ message, isUser }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 mt-auto mb-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-brand-100 text-brand-700" : "bg-blue-100 text-blue-700"}`}>
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>
        </div>

        {/* Message */}
        <div className={`
          px-4 py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed
          ${isUser 
            ? "bg-brand-600 text-white rounded-br-sm" 
            : "bg-white border border-gray-100 text-content-primary rounded-bl-sm"
          }
        `}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong className="font-bold">{children}</strong>,
              code: ({ children }) => <code className="bg-gray-100 px-1 rounded text-sm">{children}</code>,
            }}
          >
            {message}
          </ReactMarkdown>
        </div>

      </div>
    </motion.div>
  );
}
