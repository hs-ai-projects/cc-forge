"use client";

import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AppNav() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="border-b border-default-200 bg-content1 px-6 h-14 flex items-center justify-between">
      <Link href="/" className="font-semibold">cc-forge</Link>

      <nav className="flex items-center gap-6 text-sm">
        <Link href="/" className="text-default-700 hover:text-foreground">Home</Link>
        <Link href="/chat" className="text-default-700 hover:text-foreground">AI Chat</Link>
      </nav>

      <div className="flex items-center">
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                size="sm"
                src={user.image ?? undefined}
                name={user.name ?? "User"}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="user menu">
              <DropdownItem key="profile" textValue={user.name ?? ""}>
                <p className="font-semibold">{user.name}</p>
                <p className="text-tiny text-default-500">{user.email}</p>
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                onPress={() => signOut({ callbackUrl: "/signin" })}
              >
                登出
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <Button as={Link} href="/signin" variant="flat" size="sm">登录</Button>
        )}
      </div>
    </header>
  );
}
