"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const Logo = () => (
  <Link href="/" className="flex items-center font-semibold text-lg">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2 h-6 w-6"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
    Polling App
  </Link>
);

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const NavLink = ({ href, children, onClick, className }: NavLinkProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
      className
    )}
  >
    {children}
  </Link>
);

const UserAvatar = ({ user }: { user: User }) => {
  const fallback = useMemo(
    () => user?.email?.charAt(0).toUpperCase() ?? "U",
    [user]
  );

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={user.user_metadata.avatar_url} alt={user.email} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
};

const MobileMenu = ({
  isOpen,
  onToggle,
  onClose,
  navLinks,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  navLinks: Array<{ href: string; label: string }>;
}) => (
  <>
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>
    </div>
    {isOpen && (
      <div className="absolute top-full left-0 w-full bg-background shadow-md md:hidden">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="py-2"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    )}
  </>
);

const DesktopNav = ({
  navLinks,
}: {
  navLinks: Array<{ href: string; label: string }>;
}) => (
  <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
    {navLinks.map((link) => (
      <NavLink key={link.href} href={link.href}>
        {link.label}
      </NavLink>
    ))}
  </nav>
);

const AuthButton = ({ user }: { user: User | null }) => {
  const supabase = useMemo(() => createClient(), []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  }, [supabase]);

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <UserAvatar user={user} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button asChild>
      <Link href="/login">Login</Link>
    </Button>
  );
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const navLinks = useMemo(
    () => [
      { href: "/about", label: "About" },
      { href: "/pricing", label: "Pricing" },
      { href: "/contact", label: "Contact" },
    ],
    []
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>

        <MobileMenu
          isOpen={isMobileMenuOpen}
          onToggle={toggleMobileMenu}
          onClose={closeMobileMenu}
          navLinks={navLinks}
        />

        <DesktopNav navLinks={navLinks} />

        <div className="flex flex-1 items-center justify-end space-x-4">
          <AuthButton user={user} />
        </div>
      </div>
    </header>
  );
}