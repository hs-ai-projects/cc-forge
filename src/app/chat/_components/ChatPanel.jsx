"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import useQuery from "@/app/_hooks/useQuery";
import MessagePart from "./MessagePart";

export default function ChatPanel({ conversationId }) {
  const { data: history, isFetching } = useQuery(
    `/conversations/${conversationId}/messages`,
    { enabled: !!conversationId }
  );

  if (isFetching || !history) {
    return <div className="flex-1 skeleton m-4 rounded-lg" />;
  }

  return (
    <ChatPanelInner
      key={conversationId}
      conversationId={conversationId}
      initialMessages={history}
    />
  );
}

function ChatPanelInner({ conversationId, initialMessages }) {
  const [input, setInput] = useState("");

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { conversationId } }),
    [conversationId]
  );

  const { messages, sendMessage, addToolOutput, status } = useChat({
    transport,
    messages: initialMessages,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const submit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                m.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-stone-100 text-stone-900"
              }`}
            >
              {m.parts.map((part, i) => (
                <MessagePart key={i} part={part} addToolOutput={addToolOutput} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="border-t border-stone-200 p-4 flex gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="说点什么…"
          disabled={status === "streaming"}
          className="flex-1 px-4 py-2 rounded-lg border border-stone-200 bg-white outline-none focus:border-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "streaming" || !input.trim()}
          className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "streaming" ? "..." : "发送"}
        </button>
      </form>
    </div>
  );
}
