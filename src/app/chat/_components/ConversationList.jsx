"use client";

import { useEffect } from "react";
import { Button, Card } from "@heroui/react";
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

  // 自动选中第一条
  useEffect(() => {
    if (!activeId && list && list.length > 0) {
      onSelect(list[0].id);
    }
  }, [activeId, list, onSelect]);

  return (
    <div className="p-3 space-y-2">
      <Button
        color="primary"
        variant="flat"
        startContent={<Plus size={16} />}
        onPress={() => createMut.mutate()}
        isLoading={createMut.isPending}
        className="w-full"
      >
        新建会话
      </Button>

      <div className="space-y-1">
        {list?.map((conv) => (
          <Card
            key={conv.id}
            isPressable
            onPress={() => onSelect(conv.id)}
            className={`p-3 cursor-pointer ${conv.id === activeId ? "bg-primary-50" : ""}`}
          >
            <div className="flex justify-between items-center gap-2">
              <span className="truncate text-sm flex-1">{conv.title}</span>
              <button
                aria-label="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("删除该会话？")) deleteMut.mutate(conv.id);
                }}
                className="text-default-400 hover:text-danger"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
