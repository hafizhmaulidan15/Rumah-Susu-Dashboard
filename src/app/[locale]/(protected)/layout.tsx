import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { ViewTransitionProvider } from "@/components/providers/ViewTransitionProvider";
import { getSession } from "@/services/auth/auth-server";
import { isPresentationMode } from "@/utils/presentationMode";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Auth gate for all (protected) routes. Checks session once per layout render.
 * Presentation mode bypasses auth, missing session redirects to login.
 */
export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  if (!isPresentationMode()) {
    const session = await getSession();

    if (!session) {
      redirect(`/${locale}/login`);
    }
  }

  return <ViewTransitionProvider>{children}</ViewTransitionProvider>;
}
