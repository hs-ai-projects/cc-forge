"use client";

import { useState } from "react";
import AppNav from "@/app/_components/AppNav";
import Link from "next/link";
import DreoButton from "@/app/_ui/DreoButton";
import ConfirmPopover from "@/app/_ui/ConfirmPopover";
import { Trash2 } from "lucide-react";

function DreoButtonDemo() {
  const [loading, setLoading] = useState(false);

  const simulate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="rounded-lg border border-stone-200 p-6 bg-white space-y-4">
      <h2 className="text-sm font-semibold text-stone-700">DreoButton</h2>
      <div className="flex flex-wrap gap-3">
        <DreoButton onPress={simulate} isPending={loading}>
          {loading ? "处理中" : "点击触发 loading"}
        </DreoButton>
        <DreoButton variant="danger">danger</DreoButton>
        <DreoButton variant="outline">outline</DreoButton>
        <DreoButton isDisabled>disabled</DreoButton>
      </div>
    </div>
  );
}

function ConfirmPopoverDemo() {
  const [deleted, setDeleted] = useState(false);

  return (
    <div className="rounded-lg border border-stone-200 p-6 bg-white space-y-4">
      <h2 className="text-sm font-semibold text-stone-700">ConfirmPopover</h2>
      <div className="flex items-center gap-4">
        <ConfirmPopover label="确认删除这条记录？" onConfirm={() => setDeleted(true)}>
          <DreoButton color="danger" variant="outline" size="sm">
            <Trash2 className="w-4 h-4" />
            删除
          </DreoButton>
        </ConfirmPopover>
        {deleted && <span className="text-sm text-stone-400">已删除</span>}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">cc-forge</h1>
          <p className="text-stone-600">
            组件示例。想试试 ChatBot？
            <Link href="/chat" className="ml-2 text-indigo-600 underline">前往 /chat</Link>
          </p>
        </div>
        <DreoButtonDemo />
        <ConfirmPopoverDemo />
      </main>
    </div>
  );
}
