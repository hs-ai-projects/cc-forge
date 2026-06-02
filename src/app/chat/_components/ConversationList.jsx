"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import useQuery from "@/app/_hooks/useQuery";
import { createConversation, deleteConversation } from "@/app/api/_utils/conversations";

export default function ConversationList({ activeId, onSelect }) {
  const queryClient = useQueryClient();
  const { data: list } = useQuery("/api/conversations");

  const createMut = useMutation({
    mutationFn: () => createConversation(),
    onSuccess: (conv) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      onSelect(conv.id);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (activeId === id) onSelect(null);
    },
  });

  useEffect(() => {
    if (!activeId && list && list.length > 0) {
      onSelect(list[0].id);
    }
  }, [activeId, list, onSelect]);

  return (
    <div className="p-3 space-y-2">
      <button
        type="button"
        onClick={() => createMut.mutate()}
        disabled={createMut.isPending}
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-medium disabled:opacity-50"
      >
        <Plus size={16} />
        新建会话
      </button>

      <div className="space-y-1">
        {list?.map((conv) => (
          <div
            key={conv.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(conv.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(conv.id);
            }}
            className={`group p-3 rounded-lg cursor-pointer text-sm flex justify-between items-center gap-2 ${
              conv.id === activeId
                ? "bg-indigo-50 border border-indigo-200"
                : "border border-transparent hover:bg-stone-100"
            }`}
          >
            <span className="truncate flex-1">{conv.title}</span>
            <button
              type="button"
              aria-label="delete"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("删除该会话？")) deleteMut.mutate(conv.id);
              }}
              className="text-stone-400 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
