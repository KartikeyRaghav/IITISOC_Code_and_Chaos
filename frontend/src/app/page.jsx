"use client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { checkAuth } from "@/utils/checkAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      const data = await checkAuth();
      if (data.status === 200) {
        router.replace("/dashboard");
      }
    };
    verifyAuth();
  }, []);

  return (
    <div className="overflow-hidden min-h-screen bg-black text-white">
      <Header />
      <div className="h-1 w-full bg-gradient-to-r from-[#005b83] via-[#0077ab] to-purple-500" />
      <main className="px-4 py-8">
        <Hero />
      </main>
    </div>
  );
}
