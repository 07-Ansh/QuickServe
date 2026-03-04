import { ServiceGrid } from "@/components/ServiceGrid";
import { HeroSearch } from "@/components/HeroSearch";
import { ProcessSteps } from "@/components/ProcessSteps";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <header className="px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-semibold text-xl tracking-tight text-gray-800 hover:opacity-80 transition-opacity">
            QuickServe
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          <Link
            href="#services"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors hidden md:block"
          >
            Services
          </Link>
          <Link
            href="/dashboard/provider?demo=true"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-all"
          >
            Provider
          </Link>
        </div>
      </header>

      <section className="px-4 pt-20 pb-16 text-center bg-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-gray-900">
              Bringing Services, <br />
              <span className="text-primary">Closer than your ex</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
              Instant booking. Verified pros. Guaranteed satisfaction.
            </p>
          </div>

          <div className="py-8">
            <HeroSearch />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 text-center mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">The 15-Minute Promise</h2>
          <p className="text-gray-500">How QuickServe delivers help faster than anyone else.</p>
        </div>
        <ProcessSteps />
      </section>

      <main id="services" className="max-w-6xl mx-auto px-4 py-20 scroll-mt-20">
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-2xl font-semibold text-gray-900">Browse Categories</h2>
        </div>

        <ServiceGrid />

        <div className="mt-16 p-8 bg-blue-50/50 rounded-2xl flex flex-col md:flex-row items-center justify-center gap-6 border border-blue-100 text-center md:text-left">
          <div className="bg-white p-4 rounded-full shadow-sm">
            <span className="text-4xl">🛡️</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">100% Verified Professionals</h3>
            <p className="text-gray-600">Every helper undergoes a strict background check, skill assessment, and ongoing performance review.</p>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-gray-100 bg-white text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} QuickServe. Intelligent Auto-Assignment.</p>
      </footer>
    </div>
  );
}
