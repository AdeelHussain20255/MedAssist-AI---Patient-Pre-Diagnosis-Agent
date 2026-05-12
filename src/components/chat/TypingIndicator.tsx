import * as React from "react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full justify-start mb-4"
    >
      <div className="flex max-w-[85%] md:max-w-[75%] gap-3 flex-row">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-auto mb-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-700">
            <Bot size={16} />
          </div>
        </div>

        {/* Indicator */}
        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </motion.div>
  );
}
