import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to chat - AuthGuard will handle login redirect if needed
  redirect("/chat");
}
