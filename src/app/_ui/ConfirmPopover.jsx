"use client";
import { useState } from "react";
import { Popover } from "@heroui/react";
import DreoButton from "./DreoButton";

export default function ConfirmPopover({ onConfirm, children, label = "确认删除？" }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        {children}
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Dialog>
          <p className="text-xs text-[var(--text-muted)] mb-2 whitespace-nowrap">{label}</p>
          <div className="flex gap-1">
            <DreoButton size="sm" variant="outline" onPress={() => setOpen(false)}>
              取消
            </DreoButton>
            <DreoButton size="sm" variant="danger" onPress={() => { onConfirm?.(); setOpen(false); }}>
              删除
            </DreoButton>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
