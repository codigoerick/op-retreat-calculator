import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ExchangeCatalog from "@/components/exchange/ExchangeCatalog";
import SeenTracker from "@/components/SeenTracker";
import {
  EXCHANGE_BASE_URL,
  EXCHANGE_CURRENCY,
  EXCHANGE_ITEMS,
  EXCHANGE_UI,
  formatExchangeCost,
  getExchangeTotalCost,
  getExchangeTotalStock,
  isExchangeLocale,
} from "@/data/exchange";
import { EXCHANGE_NOTIFICATION_KEY } from "@/lib/exchangeNotifications";
import styles from "@/components/exchange/exchange.module.css";

type ExchangePageProps = {
  params: Promise<{ locale: string }>;
};

const OG_IMAGE = `${EXCHANGE_BASE_URL}/assets/images/og-preview.png`;

export async function generateMetadata({
  params,
}: ExchangePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isExchangeLocale(locale)) {
    return {
      title: "Exchange | OP Retreat",
      robots: { index: false, follow: false },
    };
  }

  const copy = EXCHANGE_UI[locale];
  const title =
    locale === "es"
      ? "Intercambios de OP Retreat | Costos y stock"
      : "OP Retreat Exchange | Costs & Stock";
  const canonical = `${EXCHANGE_BASE_URL}/${locale}/exchange`;

  return {
    title,
    description: copy.subtitle,
    alternates: {
      canonical,
      languages: {
        en: `${EXCHANGE_BASE_URL}/en/exchange`,
        es: `${EXCHANGE_BASE_URL}/es/exchange`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "OP Retreat Calculator",
      title,
      description: copy.subtitle,
      locale: locale === "es" ? "es_ES" : "en_US",
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: copy.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: copy.subtitle,
      images: [OG_IMAGE],
    },
  };
}

export default async function ExchangePage({ params }: ExchangePageProps) {
  const { locale } = await params;

  if (!isExchangeLocale(locale)) notFound();

  const copy = EXCHANGE_UI[locale];
  const totalCost = getExchangeTotalCost();
  const totalStock = getExchangeTotalStock();

  return (
    <div className={styles.page}>
      <SeenTracker notificationKey={EXCHANGE_NOTIFICATION_KEY} />
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>{copy.eyebrow}</span>
              <h1 className={styles.heroTitle}>{copy.title}</h1>
              <p className={styles.heroSubtitle}>{copy.subtitle}</p>

              <div className={styles.heroActions}>
                <Link href={`/${locale}`} className={styles.primaryButton}>
                  {copy.backToCalculator}
                  <i className="bi bi-calculator" aria-hidden />
                </Link>
                <span className={styles.rotationPill}>
                  <i className="bi bi-arrow-repeat" aria-hidden />
                  {copy.inRotation}
                </span>
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryTop}>
                <Image
                  src={EXCHANGE_CURRENCY.icon}
                  alt=""
                  width={56}
                  height={56}
                  sizes="56px"
                  priority
                  className={styles.currencyIcon}
                />
                <div>
                  <span className={styles.summaryLabel}>{copy.totalLabel}</span>
                  <strong className={styles.summaryCost}>
                    {formatExchangeCost(totalCost, locale)}
                  </strong>
                  <span className={styles.summaryNote}>
                    {EXCHANGE_CURRENCY.name[locale]} · {copy.totalNote}
                  </span>
                </div>
              </div>

              <div className={styles.summaryStats}>
                <div className={styles.stat}>
                  <strong className={styles.statValue}>
                    {EXCHANGE_ITEMS.length}
                  </strong>
                  <span className={styles.statLabel}>{copy.itemsLabel}</span>
                </div>
                <div className={styles.stat}>
                  <strong className={styles.statValue}>{totalStock}</strong>
                  <span className={styles.statLabel}>{copy.unitsLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.warning} role="note">
          <span className={styles.warningIcon} aria-hidden>
            <i className="bi bi-exclamation-triangle-fill" />
          </span>
          <div className={styles.warningContent}>
            <p className={styles.warningTitle}>{copy.warningTitle}</p>
            <p className={styles.warningBody}>{copy.warningBody}</p>
          </div>
        </div>
      </div>

      <section className={styles.catalogSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>{copy.eyebrow}</span>
              <h2 className={styles.sectionTitle}>{copy.catalogTitle}</h2>
              <p className={styles.sectionIntro}>{copy.catalogSubtitle}</p>
            </div>
          </div>

          <ExchangeCatalog locale={locale} />
        </div>
      </section>
    </div>
  );
}
