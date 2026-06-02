"use client";

import { Avatar, Button, Dropdown } from "@heroui/react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AppNav() {
  const { data: session } = useSession();
  const user = session?.user;

  const initials = (user?.name ?? "U")
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="border-b border-stone-200 bg-white px-6 h-14 flex items-center justify-between">
      <Link href="/" className="font-semibold">cc-forge</Link>

      <nav className="flex items-center gap-6 text-sm">
        <Link href="/" className="text-stone-600 hover:text-stone-900">Home</Link>
        <Link href="/chat" className="text-stone-600 hover:text-stone-900">AI Chat</Link>
      </nav>

      <div className="flex items-center">
        {user ? (
          <Dropdown>
            <Dropdown.Trigger>
              <Avatar size="sm">
                {user.image ? <Avatar.Image src={user.image} alt={user.name ?? ""} /> : null}
                <Avatar.Fallback>{initials}</Avatar.Fallback>
              </Avatar>
            </Dropdown.Trigger>
            <Dropdown.Popover placement="bottom end">
              <Dropdown.Menu
                aria-label="user menu"
                onAction={(key) => {
                  if (key === "logout") signOut({ callbackUrl: "/signin" });
                }}
              >
                <Dropdown.Item id="profile" textValue={user.name ?? ""} isReadOnly>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-stone-500">{user.email}</p>
                </Dropdown.Item>
                <Dropdown.Item id="logout" variant="danger">登出</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        ) : (
          <Button as={Link} href="/signin" variant="outline" size="sm">登录</Button>
        )}
      </div>
    </header>
  );
}
