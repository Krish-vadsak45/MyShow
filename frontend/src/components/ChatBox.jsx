import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatBot from "./ChatBot";

const ChatBox = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  return (
    <div className="hidden md:block">
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen && (
          <Button
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg hover:cursor-pointer"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Chat Interface */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white rounded-lg shadow-2xl w-[700px] h-[500px] flex flex-col border border-gray-200 overflow-hidden">
            <ChatBot onClose={() => setIsChatOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
