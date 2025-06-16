import Grid from "@/components/Grid";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="overflow-hidden min-h-screen bg-black text-white">
      <Header />  
      <div className="h-1 w-full bg-gradient-to-r from-[#005b83] via-[#0077ab] to-purple-500" />
      <main className="px-4 py-8">
        <Hero />
        <Grid />
      </main>
    </div>
  );
}
