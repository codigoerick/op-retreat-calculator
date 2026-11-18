import Image from "next/image";
import {
  getLocalizedBuffText,
  type BuffEntry,
  type BuffLocale,
} from "@/data/buffs";
import styles from "./buffs.module.css";

type BuffCardProps = {
  buff: BuffEntry;
  locale: BuffLocale;
};

export default function BuffCard({ buff, locale }: BuffCardProps) {
  return (
    <article
      className={`${styles.card} ${
        buff.kind === "buff" ? styles.buff : styles.debuff
      }`}
    >
      <div className={styles.iconFrame}>
        <Image
          src={buff.icon}
          alt=""
          width={64}
          height={64}
          sizes="(max-width: 640px) 52px, 64px"
          className={styles.icon}
        />
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>
            {getLocalizedBuffText(buff.title, locale)}
          </h3>
          {buff.duration && (
            <span className={styles.duration}>{buff.duration}</span>
          )}
        </div>
        <p className={styles.description}>
          {getLocalizedBuffText(buff.description, locale)}
        </p>
      </div>
    </article>
  );
}
