import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/admin");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      Coming soon...{" "}
    </main>
  );
}
