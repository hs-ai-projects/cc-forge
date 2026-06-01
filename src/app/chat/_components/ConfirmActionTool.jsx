"use client";

import { Button, Card, CardContent, CardHeader } from "@heroui/react";

export default function ConfirmActionTool({ part, addToolOutput }) {
  if (part.state === "output-available") {
    const confirmed = part.output?.confirmed;
    return (
      <div className="text-sm text-default-500 my-2">
        {confirmed ? "✓ 已确认" : "✗ 已取消"}
      </div>
    );
  }

  const submit = (confirmed) =>
    addToolOutput({
      tool: "confirmAction",
      toolCallId: part.toolCallId,
      output: { confirmed },
    });

  return (
    <Card className="my-2 border border-default-200">
      <CardHeader className="font-semibold">{part.input?.title}</CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{part.input?.description}</p>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="flat" onPress={() => submit(false)}>取消</Button>
          <Button size="sm" color="primary" onPress={() => submit(true)}>确认</Button>
        </div>
      </CardContent>
    </Card>
  );
}
