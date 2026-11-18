import type { BuffEntry, BuffLocale } from "@/data/buffs";
import BuffCard from "./BuffCard";
import styles from "./buffs.module.css";

type BuffGalleryProps = {
  buffs: BuffEntry[];
  locale: BuffLocale;
};

export default function BuffGallery({ buffs, locale }: BuffGalleryProps) {
  if (buffs.length === 0) return null;

  return (
    <div className={styles.grid}>
      {buffs.map((buff) => (
        <BuffCard key={buff.id} buff={buff} locale={locale} />
      ))}
    </div>
  );
}
