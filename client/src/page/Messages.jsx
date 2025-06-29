import { useState } from "react";
import Conversations from "../component/Conversations";
import MessageContainer from "../component/MessageContainer";

const Messages = () => {
  const [activeView, setActiveView] = useState("conversations");

  return (
    <div className="flex h-screen">
      {/* Conversations */}
      <div
        className={`w-full sm:w-1/3 md:w-2/5 lg:w-1/3 xl:w-1/4 border-r border-[#2F3336] ${
          activeView === "messages" ? "hidden sm:block" : ""
        }`}
      >
        <Conversations setActiveView={setActiveView} />
      </div>

      {/* MessageContainer */}
      <div
        className={`w-full sm:w-2/3 md:w-3/5 lg:w-2/3 xl:w-3/4 ${
          activeView === "conversations" ? "hidden sm:block" : ""
        }`}
      >
        <MessageContainer setActiveView={setActiveView} />
      </div>
    </div>
  );
};

export default Messages;
