import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-blue-600">TalentMatch</div>
            <div className="flex space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your AI-Powered Career
            <br />
            <span className="text-blue-600">Launchpad</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            TalentMatch connects students and fresh graduates with opportunities through
            hackathons, AI-powered career guidance, and intelligent job matching.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 font-semibold transition shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-blue-600 text-lg rounded-lg hover:bg-gray-50 font-semibold transition border-2 border-blue-600"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="🎯"
            title="Real-World Challenges"
            description="Participate in hackathons, business challenges, and case studies to build your portfolio"
          />
          <FeatureCard
            icon="🤖"
            title="AI Virtual Panel"
            description="Get evaluated by AI agents simulating HR, Tech Lead, and Career Coach perspectives"
          />
          <FeatureCard
            icon="💼"
            title="Smart Job Matching"
            description="AI-powered Reverse Recruiter finds opportunities that match your skills and preferences"
          />
          <FeatureCard
            icon="🏆"
            title="Digital Badges"
            description="Earn QR-verifiable badges for achievements and stand out to employers"
          />
          <FeatureCard
            icon="🎤"
            title="AI Interview Practice"
            description="Practice with voice-to-voice AI interviews tailored to your profile and target roles"
          />
          <FeatureCard
            icon="📊"
            title="Talent Dashboard"
            description="Track your progress, view leaderboards, and showcase your projects to recruiters"
          />
        </div>

        {/* Stats Section */}
        <div className="mt-24 bg-white rounded-2xl shadow-xl p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Active Candidates</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Hiring Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Events Hosted</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Launch Your Career?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of students and graduates building their future with TalentMatch
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 font-semibold transition shadow-lg"
          >
            Create Your Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-24 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-2xl font-bold mb-4">TalentMatch</div>
          <p className="text-gray-400">
            Empowering the next generation of talent through AI and innovation
          </p>
          <div className="mt-8 text-gray-400 text-sm">
            © 2025 TalentMatch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
