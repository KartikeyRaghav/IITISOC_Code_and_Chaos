import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Hero2 from "@/components/Hero";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="pt-[1rem] overflow-hidden min-h-screen bg-black text-white">
      <Header />
      
      <div className="h-1 w-full bg-gradient-to-r from-[#005b83] via-[#0077ab] to-purple-500" />
      <main className="px-4 py-8">
        <Hero2 />
      </main>
    </div>
  );
}
