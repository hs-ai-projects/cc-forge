"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ConfirmActionTool from "./ConfirmActionTool";

export default function MessagePart({ part, addToolOutput }) {
  switch (part.type) {
    case "text":
      return (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
        </div>
      );
    case "tool-confirmAction":
      return <ConfirmActionTool part={part} addToolOutput={addToolOutput} />;
    case "tool-getCurrentTime":
      if (part.state === "output-available") {
        return (
          <div className="text-xs text-stone-500 my-1">
            🕐 {part.output?.iso} ({part.output?.timezone})
          </div>
        );
      }
      return <div className="text-xs text-stone-400 my-1">查询时间中…</div>;
    default:
      return null;
  }
}
