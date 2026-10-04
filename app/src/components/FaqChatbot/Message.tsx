import React from "react";
import { FileComponent } from "./FileComponent";

export interface ChatMessage {
  message: string;
  isUserMessage: boolean;
  isFile?: boolean;
}

interface MessageProps {
  msg: ChatMessage;
}

export const Message: React.FC<MessageProps> = ({ msg }) => {

  const { isFile = false } = msg;

  const bubbleBaseUser =
    "max-w-[45%] rounded-2xl px-3 py-2 whitespace-pre-wrap break-words";

  const bubbleBaseAI =
    "max-w-[50%] rounded-2xl px-3 py-2 whitespace-pre-wrap break-words";

  // User message (right, no avatar)
  if (msg.isUserMessage) {
    return (
      <div className="flex w-full justify-end">
        <div className={`${bubbleBaseUser} bg-(--secondary-400) text-white text-sm rounded-br-md shadow-lg`}>
          {msg.message}
        </div>
      </div>
    );
  }
  else if (isFile) {
    return (
      <div className="flex w-full justify-start">
        <div className="flex items-start space-x-2 max-w-[80%]">
            <FileComponent />
        </div>
      </div>
    );
  }


  // Bot message (left, avatar)
  return (
    <div className="flex w-full justify-start">
      <div className="flex items-start space-x-2 max-w-[100%]">
        <div className="w-8 h-8 rounded-full bg-(--secondary-400) flex items-center justify-center text-white font-semibold shrink-0">
          AI
        </div>
        <div className={`${bubbleBaseAI} bg-white text-gray-900 text-sm rounded-bl-md shadow-lg`}>
          {msg.message}
        </div>
      </div>
    </div>
  );
};
