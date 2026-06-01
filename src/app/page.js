import AppNav from "@/app/_components/AppNav";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold mb-4">cc-forge</h1>
        <p className="text-default-500 mb-8">
          这是 cc-forge 模板的空白主页。把这块替换成你的业务首页。
        </p>
        <div className="rounded-lg border border-default-200 p-6 bg-content1">
          <p className="text-sm text-default-500 mb-2">想试试 ChatBot demo？</p>
          <Link href="/chat" className="text-primary underline">前往 /chat</Link>
        </div>
      </main>
    </div>
  );
}
