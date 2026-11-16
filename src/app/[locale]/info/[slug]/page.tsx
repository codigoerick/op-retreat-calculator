import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  INFO_ARTICLES,
  INFO_BASE_URL,
  INFO_UI,
  formatInfoDate,
  getCategory,
  getInfoArticle,
  getInfoNotificationKey,
  getLocalized,
  isInfoLocale,
  type InfoBlock,
  type InfoLocale,
} from "@/data/info";
import InfoArticleSeenTracker from "../InfoArticleSeenTracker";
import styles from "../info.module.css";

type InfoArticlePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

const OG_IMAGE = `${INFO_BASE_URL}/assets/images/og-preview.png`;

export function generateStaticParams() {
  return ["en", "es"].flatMap((locale) =>
    INFO_ARTICLES.map((article) => ({ locale, slug: article.slug }))
  );
}

export async function generateMetadata({
  params,
}: InfoArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isInfoLocale(locale)) {
    return {
      title: "Info | OP Retreat",
      robots: { index: false, follow: false },
    };
  }

  const article = getInfoArticle(slug);

  if (!article) {
    return {
      title: `${INFO_UI[locale].notFoundTitle} | OP Retreat`,
      robots: { index: false, follow: false },
    };
  }

  const title = `${getLocalized(article.title, locale)} | OP Retreat`;
  const description = getLocalized(article.excerpt, locale);
  const canonical = `${INFO_BASE_URL}/${locale}/info/${article.slug}`;

  return {
    title,
    description,
    keywords: article.tags[locale],
    alternates: {
      canonical,
      languages: {
        en: `${INFO_BASE_URL}/en/info/${article.slug}`,
        es: `${INFO_BASE_URL}/es/info/${article.slug}`,
      },
    },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: "OP Retreat Calculator",
      title,
      description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: getLocalized(article.title, locale),
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

export default async function InfoArticlePage({
  params,
}: InfoArticlePageProps) {
  const { locale, slug } = await params;

  if (!isInfoLocale(locale)) notFound();

  const article = getInfoArticle(slug);

  if (!article) notFound();

  const copy = INFO_UI[locale];
  const category = getCategory(article.category);
  const title = getLocalized(article.title, locale);
  const excerpt = getLocalized(article.excerpt, locale);
  const canonical = `${INFO_BASE_URL}/${locale}/info/${article.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: locale,
    mainEntityOfPage: canonical,
    image: OG_IMAGE,
    author: {
      "@type": "Organization",
      name: "OP Retreat Calculator",
    },
    publisher: {
      "@type": "Organization",
      name: "OP Retreat Calculator",
    },
  };

  return (
    <div className={styles.page}>
      <InfoArticleSeenTracker
        notificationKey={getInfoNotificationKey(article)}
      />
      <div className={styles.container}>
        <nav
          className={styles.breadcrumb}
          aria-label={locale === "es" ? "Ruta de navegación" : "Breadcrumb"}
        >
          <Link href={`/${locale}`}>{copy.home}</Link>
          <span className={styles.breadcrumbSeparator} aria-hidden>
            /
          </span>
          <Link href={`/${locale}/info`}>{copy.backToInfo}</Link>
          <span className={styles.breadcrumbSeparator} aria-hidden>
            /
          </span>
          <span aria-current="page">{title}</span>
        </nav>

        <article className={styles.article}>
          <header className={styles.articleHeader}>
            <div className={styles.articleIcon}>
              <Image
                src={article.icon}
                alt=""
                width={62}
                height={62}
                sizes="62px"
                priority
              />
            </div>
            <div className={styles.articleHeaderContent}>
              <span className={styles.eyebrow}>
                {category ? getLocalized(category.label, locale) : copy.category}
              </span>
              <h1 className={styles.articleTitle}>{title}</h1>
              <p className={styles.articleExcerpt}>{excerpt}</p>
              <div className={styles.articleMeta}>
                <span>
                  {copy.updated} {formatInfoDate(article.updatedAt, locale)}
                </span>
                <span className={styles.metaDot} aria-hidden />
                <span>
                  {article.readingMinutes} {copy.minRead}
                </span>
              </div>
              <div className={styles.tags} aria-label={copy.tags}>
                {article.tags[locale].map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </header>

          <div className={styles.articleBody}>
            {article.blocks.map((block, index) => (
              <InfoBlockView
                key={`${block.type}-${index}`}
                block={block}
                locale={locale}
              />
            ))}
          </div>

          <footer className={styles.articleFooter}>
            <p className={styles.source}>
              {copy.source}: {getLocalized(article.source, locale)}
            </p>
            <div className={styles.articleActions}>
              <Link href={`/${locale}/info`} className={styles.secondaryButton}>
                {copy.backToInfo}
              </Link>
              <Link href={`/${locale}`} className={styles.primaryButton}>
                {copy.backToCalculator}
              </Link>
            </div>
          </footer>
        </article>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}

function InfoBlockView({
  block,
  locale,
}: {
  block: InfoBlock;
  locale: InfoLocale;
}) {
  switch (block.type) {
    case "paragraph":
      return <p>{getLocalized(block.text, locale)}</p>;

    case "heading":
      return <h2>{getLocalized(block.text, locale)}</h2>;

    case "list": {
      const items = block.items[locale];
      const ListTag = block.ordered ? "ol" : "ul";

      return (
        <ListTag>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ListTag>
      );
    }

    case "table": {
      const [firstColumn, secondColumn] = block.columns[locale];

      return (
        <div className={styles.tableWrap}>
          <table className={styles.dataTable}>
            {block.caption && (
              <caption>{getLocalized(block.caption, locale)}</caption>
            )}
            <thead>
              <tr>
                <th scope="col">{firstColumn}</th>
                <th scope="col">{secondColumn}</th>
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={getLocalized(row.label, locale)}>
                  <th scope="row">
                    <span className={styles.skillCell}>
                      {row.icon && (
                        <Image
                          src={row.icon}
                          alt=""
                          width={36}
                          height={36}
                          sizes="36px"
                          loading="eager"
                        />
                      )}
                      <span>{getLocalized(row.label, locale)}</span>
                    </span>
                  </th>
                  <td>
                    <span className={styles.shareCell}>
                      <strong>{row.value}</strong>
                      {typeof row.share === "number" && (
                        <span className={styles.barTrack} aria-hidden>
                          <span
                            className={styles.barFill}
                            style={{ width: `${row.share}%` }}
                          />
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "callout": {
      const toneClass =
        block.tone === "warning"
          ? styles.calloutWarning
          : block.tone === "success"
            ? styles.calloutSuccess
            : styles.calloutInfo;

      return (
        <aside className={`${styles.callout} ${toneClass}`}>
          <div className={styles.calloutBody}>
            {block.title && (
              <p className={styles.calloutTitle}>
                {getLocalized(block.title, locale)}
              </p>
            )}
            <p className={styles.calloutText}>{getLocalized(block.text, locale)}</p>
          </div>
        </aside>
      );
    }

    case "image":
      return (
        <figure className={styles.figure}>
          <Image
            src={block.src}
            alt={getLocalized(block.alt, locale)}
            width={block.width}
            height={block.height}
            sizes="(max-width: 900px) 100vw, 900px"
          />
          {block.caption && (
            <figcaption>{getLocalized(block.caption, locale)}</figcaption>
          )}
        </figure>
      );

    default:
      return null;
  }
}
