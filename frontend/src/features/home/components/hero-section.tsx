import Image from "next/image"

export function HeroSection() {
  return (
    <section
      className="relative isolate overflow-hidden rounded-2xl min-h-[44vh] sm:min-h-[52vh]"
      aria-label="ヒーローセクション"
    >
      {/* background image */}
      <Image
        src="/hero.jpg"
        alt="LogBook hero image"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* overlay */}
      <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
      {/* content */}
      <div className="relative flex items-end p-6 sm:p-10">
        <div className=" w-full max-w-3xl">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            LogBook
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-white/85 sm:text-lg">
            原因・対応・学びを記録するブログ。
          </p>
        </div>
      </div>
    </section>
  )
}
