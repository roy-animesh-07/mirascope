import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) redirect("/sign-in")

  return (
    <>
       <div className="min-h-screen flex flex-col">
      <Navbar />
        <main className="grow flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <p className="text-lg">Welcome, {session.user.name}!</p>
        </main>

      <Footer />
    </div>
    </>
  )
}
