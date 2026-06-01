export default function HomePage() {
  return (
    <section className="flex flex-1 items-center justify-center py-32 text-center">
      <div>
        <p className="font-display mb-4 text-xs font-700 uppercase tracking-widest text-accent">
          Kaokoland, Namibia
        </p>
        <h1 className="font-display mb-4 text-6xl font-900 uppercase leading-none tracking-tight text-bone md:text-8xl">
          Less Glamping.
          <br />
          <span className="text-accent">More Gravel.</span>
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-khaki">
          Honest dispatches from the tracks less taken across Africa. No sponsored fluff.
        </p>
      </div>
    </section>
  )
}
