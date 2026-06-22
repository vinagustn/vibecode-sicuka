import { redirect } from "next/navigation"
import { getCurrentSession } from "@/app/actions/auth"

export default async function HomePage() {
  const session = await getCurrentSession()

  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
