"use client";

import { useState } from "react";
import AppNav from "@/app/_components/AppNav";
import ConversationList from "./_components/ConversationList";
import ChatPanel from "./_components/ChatPanel";

export default function ChatPage() {
  const [activeId, setActiveId] = useState(null);

  return (
    <div className="h-screen flex flex-col">
      <AppNav />
      <div className="flex-1 flex min-h-0">
        <aside className="w-72 border-r border-default-200 overflow-y-auto">
          <ConversationList activeId={activeId} onSelect={setActiveId} />
        </aside>
        <section className="flex-1 flex flex-col min-h-0">
          {activeId ? (
            <ChatPanel conversationId={activeId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-default-400">
              选择或新建一个会话开始聊天
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
