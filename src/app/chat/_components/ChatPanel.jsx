"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { Button, Input } from "@heroui/react";
import useQuery from "@/app/_hooks/useQuery";
import MessagePart from "./MessagePart";

export default function ChatPanel({ conversationId }) {
  const { data: history, isFetching } = useQuery(
    `/api/conversations/${conversationId}/messages`,
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
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                m.role === "user" ? "bg-primary text-white" : "bg-content2"
              }`}
            >
              {m.parts.map((part, i) => (
                <MessagePart key={i} part={part} addToolOutput={addToolOutput} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="border-t border-default-200 p-4 flex gap-2">
        <Input
          value={input}
          onValueChange={setInput}
          placeholder="说点什么…"
          isDisabled={status === "streaming"}
          className="flex-1"
        />
        <Button
          type="submit"
          color="primary"
          isLoading={status === "streaming"}
          isDisabled={!input.trim()}
        >
          发送
        </Button>
      </form>
    </div>
  );
}
