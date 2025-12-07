import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="grow flex items-center justify-center">
        content
      </main>

      <Footer />
    </div>
  );
}
