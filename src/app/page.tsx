import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await prisma.userProfile.findFirst({
    select: { id: true },
  });

  redirect(profile ? "/dashboard" : "/onboarding");
}
