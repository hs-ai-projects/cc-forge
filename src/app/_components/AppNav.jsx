"use client";

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@heroui/react";
import { useSession, signOut } from "next-auth/react";

export default function AppNav() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Navbar maxWidth="full" isBordered>
      <NavbarBrand>
        <Link href="/" color="foreground" className="font-semibold">cc-forge</Link>
      </NavbarBrand>

      <NavbarContent justify="center">
        <NavbarItem>
          <Link href="/" color="foreground">Home</Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/chat" color="foreground">AI Chat</Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
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
              <DropdownItem key="logout" color="danger" onPress={() => signOut({ callbackUrl: "/signin" })}>
                登出
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <NavbarItem>
            <Button href="/signin" as={Link} variant="flat">登录</Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
}
