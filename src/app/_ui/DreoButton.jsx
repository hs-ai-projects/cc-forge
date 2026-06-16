"use client";

import { Button } from "@heroui/react";
import { Loader2 } from "lucide-react";

/**
 * 项目内统一的按钮入口。复用 kg-system 的实现:
 * - isPending 控制 loading 态(disable + loader icon)
 * - 其余 props 透传给 @heroui/react Button
 */
export default function DreoButton({ children, isPending, ...props }) {
  return (
    <Button isDisabled={isPending} {...props}>
      {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </Button>
  );
}
