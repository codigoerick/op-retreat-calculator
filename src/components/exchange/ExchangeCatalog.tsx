"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  EXCHANGE_CURRENCY,
  EXCHANGE_FILTERS,
  EXCHANGE_GROUP_LABELS,
  EXCHANGE_ITEMS,
  EXCHANGE_UI,
  formatExchangeCost,
  getExchangeItemTotal,
  getExchangeText,
  type ExchangeFilter,
  type ExchangeGroup,
  type ExchangeLocale,
} from "@/data/exchange";
import styles from "./exchange.module.css";

type ExchangeCatalogProps = {
  locale: ExchangeLocale;
};

const GROUP_CLASS: Record<ExchangeGroup, string> = {
  equipment: styles.groupEquipment,
  chests: styles.groupChests,
  materials: styles.groupMaterials,
};

export default function ExchangeCatalog({ locale }: ExchangeCatalogProps) {
  const copy = EXCHANGE_UI[locale];
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ExchangeFilter>("all");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLocaleLowerCase(locale === "es" ? "es" : "en");

    return EXCHANGE_ITEMS.filter((item) => {
      const matchesFilter = filter === "all" || item.group === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        getExchangeText(item.title, locale)
          .toLocaleLowerCase(locale === "es" ? "es" : "en")
          .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, locale, query]);

  const showing = copy.showing
    .replace("{shown}", String(filteredItems.length))
    .replace("{total}", String(EXCHANGE_ITEMS.length));

  return (
    <section aria-label={copy.catalogTitle}>
      <div className={styles.controls}>
        <div
          className={styles.filters}
          role="group"
          aria-label={copy.filtersLabel}
        >
          {EXCHANGE_FILTERS.map((option) => {
            const active = filter === option.id;

            return (
              <button
                key={option.id}
                type="button"
                className={`${styles.filterButton} ${active ? styles.filterButtonActive : ""}`}
                onClick={() => setFilter(option.id)}
                aria-pressed={active}
              >
                {getExchangeText(option.label, locale)}
              </button>
            );
          })}
        </div>

        <label className={styles.search} htmlFor="exchange-search">
          <span className={styles.srOnly}>{copy.searchLabel}</span>
          <i className="bi bi-search" aria-hidden />
          <input
            id="exchange-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className={styles.searchInput}
            autoComplete="off"
          />
        </label>
      </div>

      <p className={styles.results} aria-live="polite">
        {showing}
      </p>

      {filteredItems.length > 0 ? (
        <div className={styles.grid}>
          {filteredItems.map((item) => {
            const stockLabel =
              item.stock === 1 ? copy.exchange : copy.exchanges;

            return (
              <article key={item.id} className={styles.card}>
                <div className={styles.cardMain}>
                  <div className={styles.iconWrap}>
                    <Image
                      src={item.icon}
                      alt=""
                      width={64}
                      height={64}
                      sizes="64px"
                      className={styles.itemIcon}
                    />
                    <span className={styles.stockBadge} aria-hidden>
                      x{item.stock}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardMeta}>
                      <span
                        className={`${styles.groupBadge} ${GROUP_CLASS[item.group]}`}
                      >
                        {getExchangeText(
                          EXCHANGE_GROUP_LABELS[item.group],
                          locale
                        )}
                      </span>
                      <span className={styles.stockText}>
                        {item.stock} {stockLabel}
                      </span>
                    </div>
                    <h3 className={styles.cardTitle}>
                      {getExchangeText(item.title, locale)}
                    </h3>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.unitCost}>
                    <Image
                      src={EXCHANGE_CURRENCY.icon}
                      alt=""
                      width={24}
                      height={24}
                      sizes="24px"
                      className={styles.coin}
                    />
                    <div>
                      <strong className={styles.costValue}>
                        {formatExchangeCost(item.cost, locale)}
                      </strong>
                      <span className={styles.costLabel}>{copy.perUnit}</span>
                    </div>
                  </div>

                  <div className={styles.itemTotal}>
                    <span className={styles.totalLabel}>
                      {copy.itemTotal.replace(
                        "{count}",
                        String(item.stock)
                      )}
                    </span>
                    <strong className={styles.totalValue}>
                      {formatExchangeCost(
                        getExchangeItemTotal(item),
                        locale
                      )}
                    </strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <i className="bi bi-search" aria-hidden />
          <p>{copy.noResults}</p>
          <span>{copy.noResultsHint}</span>
        </div>
      )}

      <p className={styles.disclaimer}>{copy.disclaimer}</p>
    </section>
  );
}
