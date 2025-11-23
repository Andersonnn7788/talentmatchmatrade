import DashboardNav from '@/components/DashboardNav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      {/* Main content with padding for fixed header and sidebar */}
      <main className="pt-16 md:pl-64 pb-16 md:pb-0">
        <div className="md:pt-0 pt-14">
          {children}
        </div>
      </main>
    </div>
  )
}

