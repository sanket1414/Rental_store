import Hero from "@/components/Hero";
import CollectionGrid from "@/components/CollectionGrid";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <CollectionGrid />

      {/* Testimonial / Trust Section */}
      <section className="py-20 bg-[#050505] border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-12">Trusted by 500+ Happy Clients</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-800 hover:border-[#D4AF37]/30 transition-colors duration-300">
                <div className="flex justify-center mb-4 text-[#D4AF37]">
                  ★★★★★
                </div>
                <p className="text-gray-400 italic mb-6">&quot;Absolutely stunning collection! The team helped me find the perfect lehenga for my reception. Highly recommended!&quot;</p>
                <div className="font-semibold text-white">- Happy Customer</div>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
