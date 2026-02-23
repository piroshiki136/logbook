import {
  AboutMeSection,
  HeroSection,
  LatestArticlesSection,
} from "@/features/home"

export default function Page() {
  return (
    <div className="min-h-screen p-6">
      <HeroSection />
      <LatestArticlesSection />
      <AboutMeSection />
    </div>
  )
}
