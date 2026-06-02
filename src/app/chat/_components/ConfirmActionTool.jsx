"use client";

export default function ConfirmActionTool({ part, addToolOutput }) {
  if (part.state === "output-available") {
    const confirmed = part.output?.confirmed;
    return (
      <div className="text-sm text-stone-500 my-2">
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
    <div className="my-2 rounded-lg border border-stone-200 bg-white text-stone-900">
      <div className="px-4 py-3 font-semibold border-b border-stone-100">
        {part.input?.title}
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm text-stone-700">{part.input?.description}</p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => submit(false)}
            className="px-3 py-1.5 text-sm rounded-md border border-stone-200 hover:bg-stone-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => submit(true)}
            className="px-3 py-1.5 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
