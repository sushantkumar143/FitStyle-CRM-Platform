import { useEffect } from 'react'
import Navbar from './Navbar'
import HeroSection from './HeroSection'
import SocialProofSection from './SocialProofSection'
import FeaturesSection from './FeaturesSection'
import AICopilotShowcase from './AICopilotShowcase'
import DashboardPreviewSection from './DashboardPreviewSection'
import AnalyticsShowcase from './AnalyticsShowcase'
import AIInsightsSection from './AIInsightsSection'
import CTASection from './CTASection'
import Footer from './Footer'

export default function LandingPage() {
  useEffect(() => {
    // Apply landing page light theme
    document.documentElement.classList.remove('dark')
    document.body.classList.add('landing-page')

    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth'

    return () => {
      // Restore dark theme for dashboard
      document.documentElement.classList.add('dark')
      document.body.classList.remove('landing-page')
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <HeroSection />
        <SocialProofSection />
        <FeaturesSection />
        <AICopilotShowcase />
        <DashboardPreviewSection />
        <AnalyticsShowcase />
        <AIInsightsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
