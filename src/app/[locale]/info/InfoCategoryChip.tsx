"use client";

import { useEffect, useState } from "react";
import { hasUnseenKeys, markKeysSeen } from "@/lib/infoNotifications";
import styles from "./info.module.css";

type InfoCategoryChipProps = {
  icon: string;
  label: string;
  count: number;
  articleKeys: string[];
  newLabel: string;
};

export default function InfoCategoryChip({
  icon,
  label,
  count,
  articleKeys,
  newLabel,
}: InfoCategoryChipProps) {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const unseen = hasUnseenKeys(articleKeys);
    if (!unseen) return;

    // One-time sync with localStorage after hydration so the badge can stay
    // visible for this visit without causing a server/client mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsNew(true);

    // Keep the dot visible for this visit, then remember the category as seen.
    markKeysSeen(articleKeys);
  }, [articleKeys]);

  return (
    <span className={styles.categoryChip}>
      <i className={`bi ${icon}`} aria-hidden />
      {label}
      <span className={styles.categoryCount}>{count}</span>
      {isNew && (
        <span
          className={styles.categoryNewDot}
          role="img"
          aria-label={newLabel}
          title={newLabel}
        />
      )}
    </span>
  );
}
