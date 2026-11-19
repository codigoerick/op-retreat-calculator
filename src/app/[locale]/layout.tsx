import ScrollNavigation from "@/components/ScrollNavigation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import UpdateToast from "@/components/UpdateToast";
import { INFO_ARTICLES, getInfoNotificationKey } from "@/data/info";
import { getAppVersion } from "@/lib/appVersion";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const lang = locale === "es" ? "es" : "en";
  const notificationKeys = INFO_ARTICLES.map(getInfoNotificationKey);
  const buildVersion = getAppVersion();

  return (
    <main
      lang={lang}
      className="container-fluid p-0 min-vh-100 d-flex flex-column"
    >
      <SiteHeader notificationKeys={notificationKeys} />
      <div className="flex-grow-1 d-flex flex-column">{children}</div>
      <SiteFooter />
      <UpdateToast buildVersion={buildVersion} />
      <ScrollNavigation />
    </main>
  );
}
