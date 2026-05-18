import ScrollyCanvas from "@/components/ScrollyCanvas";
import Overlay from "@/components/Overlay";
import Projects from "@/components/Projects";
import Navbar from "@/components/Navbar";
import { getProjects } from "@/lib/projects";


export default function Home() {
  const categories = getProjects();

  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      
      {/* Hero Section with Scrollytelling */}
      <ScrollyCanvas>
        <Overlay />
      </ScrollyCanvas>

      {/* Projects Grid Section */}
      <div className="relative z-20 bg-background">
        <Projects categories={categories} />
      </div>
      
      {/* Footer */}
      <footer className="bg-black py-12 px-8 text-center text-white/40 text-sm">
        <p>© {new Date().getFullYear()} John Paul Maulion. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
