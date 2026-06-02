import AppNav from "@/app/_components/AppNav";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-4">cc-forge</h1>
        <p className="text-stone-600 mb-8">
          这是 cc-forge 模板的空白主页。把这块替换成你的业务首页。
        </p>
        <div className="rounded-lg border border-stone-200 p-6 bg-white">
          <p className="text-sm text-stone-600 mb-2">想试试 ChatBot demo？</p>
          <Link href="/chat" className="text-indigo-600 underline">前往 /chat</Link>
        </div>
      </main>
    </div>
  );
}
