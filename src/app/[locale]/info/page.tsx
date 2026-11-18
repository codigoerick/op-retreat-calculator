import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuffGallery from "@/components/buffs/BuffGallery";
import { getPublicBuffs } from "@/lib/buffs";
import {
  INFO_ARTICLES,
  INFO_BASE_URL,
  INFO_CATEGORIES,
  INFO_UI,
  formatInfoDate,
  getCategory,
  getInfoNotificationKey,
  getLocalized,
  isInfoLocale,
} from "@/data/info";
import InfoCategoryChip from "./InfoCategoryChip";
import styles from "./info.module.css";

type InfoHubPageProps = {
  params: Promise<{ locale: string }>;
};

const OG_IMAGE = `${INFO_BASE_URL}/assets/images/og-preview.png`;

export async function generateMetadata({
  params,
}: InfoHubPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isInfoLocale(locale)) {
    return {
      title: "Info | OP Retreat",
      robots: { index: false, follow: false },
    };
  }

  const title =
    locale === "es"
      ? "Información de OP Retreat | Guías y datos"
      : "OP Retreat Info | Guides & Data";
  const description = INFO_UI[locale].subtitle;
  const canonical = `${INFO_BASE_URL}/${locale}/info`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${INFO_BASE_URL}/en/info`,
        es: `${INFO_BASE_URL}/es/info`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "OP Retreat Calculator",
      title,
      description,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: "OP Retreat Info",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

export default async function InfoHubPage({ params }: InfoHubPageProps) {
  const { locale } = await params;

  if (!isInfoLocale(locale)) notFound();

  const copy = INFO_UI[locale];
  const buffs = await getPublicBuffs();
  const articles = [...INFO_ARTICLES].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
  const latest = articles[0];
  const categories = INFO_CATEGORIES.map((category) => ({
    ...category,
    count: articles.filter((article) => article.category === category.id).length,
  })).filter((category) => category.count > 0);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <div>
              <span className={styles.eyebrow}>{copy.eyebrow}</span>
              <h1 className={styles.heroTitle}>{copy.title}</h1>
              <p className={styles.heroSubtitle}>{copy.subtitle}</p>

              <div className={styles.heroActions}>
                <Link href={`/${locale}`} className={styles.primaryButton}>
                  {copy.backToCalculator}
                  <i className="bi bi-calculator" aria-hidden />
                </Link>
                {latest && (
                  <Link
                    href={`/${locale}/info/${latest.slug}`}
                    className={styles.secondaryButton}
                  >
                    {copy.readLatest}
                    <i className="bi bi-arrow-right" aria-hidden />
                  </Link>
                )}
              </div>
            </div>

            <div className={styles.heroPanel}>
              <div className={styles.heroStat}>
                <strong className={styles.heroStatValue}>{articles.length}</strong>
                <span className={styles.heroStatLabel}>{copy.allGuides}</span>
              </div>
              <div className={styles.heroStat}>
                <strong className={styles.heroStatValue}>{categories.length}</strong>
                <span className={styles.heroStatLabel}>{copy.categories}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>{copy.eyebrow}</span>
              <h2 className={styles.sectionTitle}>{copy.allGuides}</h2>
            </div>
          </div>

          <div className={styles.categories}>
            {categories.map((category) => (
              <InfoCategoryChip
                key={category.id}
                icon={category.icon}
                label={getLocalized(category.label, locale)}
                count={category.count}
                articleKeys={articles
                  .filter((article) => article.category === category.id)
                  .map(getInfoNotificationKey)}
                newLabel={copy.new}
              />
            ))}
          </div>

          {articles.length === 0 ? (
            <div className={styles.empty}>{copy.empty}</div>
          ) : (
            <div className={styles.grid}>
              {articles.map((article) => {
                const category = getCategory(article.category);

                return (
                  <article key={article.slug} className={styles.card}>
                    <div className={styles.cardIcon}>
                      <Image
                        src={article.icon}
                        alt=""
                        width={48}
                        height={48}
                        sizes="48px"
                        loading="eager"
                      />
                    </div>
                    <div className={styles.cardBody}>
                      <span className={styles.cardCategory}>
                        {category ? getLocalized(category.label, locale) : copy.category}
                      </span>
                      <h3 className={styles.cardTitle}>
                        <Link href={`/${locale}/info/${article.slug}`}>
                          {getLocalized(article.title, locale)}
                        </Link>
                      </h3>
                      <p className={styles.cardExcerpt}>
                        {getLocalized(article.excerpt, locale)}
                      </p>
                      <div className={styles.cardMeta}>
                        <span>
                          {article.readingMinutes} {copy.minRead}
                        </span>
                        <span className={styles.metaDot} aria-hidden />
                        <span>
                          {copy.updated} {formatInfoDate(article.updatedAt, locale)}
                        </span>
                      </div>
                      <Link
                        href={`/${locale}/info/${article.slug}`}
                        className={styles.cardLink}
                      >
                        {copy.readGuide}
                        <i className="bi bi-arrow-right" aria-hidden />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {buffs.length > 0 && (
        <section id="buffs" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>{copy.eyebrow}</span>
                <h2 className={styles.sectionTitle}>{copy.buffsTitle}</h2>
                <p className={styles.sectionIntro}>{copy.buffsSubtitle}</p>
              </div>
              <span className={styles.buffCount}>
                {buffs.length} {copy.buffsCount}
              </span>
            </div>

            <BuffGallery buffs={buffs} locale={locale} />
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.comingSoon}>
            <div className={styles.comingSoonIcon} aria-hidden>
              <i className="bi bi-stars" />
            </div>
            <div>
              <h2>{copy.moreComing}</h2>
              <p>{copy.moreComingBody}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
