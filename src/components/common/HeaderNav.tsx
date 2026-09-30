"use client";
import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";

interface HeaderNavProps {
  title: string;
  backUrl?: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  title,
  backUrl = "/student/path",
}) => {
  return (
    <header className="w-full max-w-6xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center p-4 bg-white/80 backdrop-blur rounded-3xl shadow-md border-2 border-slate-100 mb-6">
      <Link
        href={backUrl}
        className="flex w-fit items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl font-bold text-lg transition-transform active:scale-90">
        <Home className="w-6 h-6" />
        <span>หน้าหลัก</span>
      </Link>

      <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight text-center">
        {title}
      </h1>

      <div aria-hidden="true" />
    </header>
  );
};
