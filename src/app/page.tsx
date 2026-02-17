import Hero from "@/components/Hero";
import CollectionGrid from "@/components/CollectionGrid";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <CollectionGrid />

      <section className="py-20 bg-[#050505] border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-12">Trusted by our Happy Clients</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Priyanka Deshmukh",
                review: "Mazi wedding reception sathi lehenga rent kela hota, finishing khup chan hoti. Fit pan perfect basal. Staff is very helpful!",
                rating: 5
              },
              {
                name: "Aniket Shinde",
                review: "Quality is top notch. I rented a Sherwani for my brother's wedding, everyone loved it. Price is also very reasonable compared to buying.",
                rating: 5
              },
              {
                name: "Sneha Patil",
                review: "Navari saree cha collection khupach sundar aahe. Parnika studio is best for rental clothes in PCMC area.",
                rating: 5
              }
            ].map((t, i) => (
              <div key={i} className="bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-800 hover:border-[#D4AF37]/30 transition-colors duration-300">
                <div className="flex justify-center mb-4 text-[#D4AF37]">
                  {"★".repeat(t.rating)}
                </div>
                <p className="text-gray-400 italic mb-6">&quot;{t.review}&quot;</p>
                <div className="font-semibold text-white">- {t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
