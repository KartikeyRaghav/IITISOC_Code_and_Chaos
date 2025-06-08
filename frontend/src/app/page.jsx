import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';


export default function Home() {
  return (
    <div className='pt-[1rem] overflow-hidden min-h-screen bg-gradient-to-b from-[#000e14] to-[#00141f] text-white'>
      <Header />
      <Navbar />
      <div className="h-1 w-full bg-gradient-to-r from-[#002233] via-[#003047] to-[#002233]" />
      <main className='px-4 py-8'>
        <Hero /> 
      </main>
    </div>
  );
}