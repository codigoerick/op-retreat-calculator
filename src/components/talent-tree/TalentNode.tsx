/* Game icons come from a fixed local sprite set (3-7 KB each); next/image
   would add srcset churn without a real win here. */
/* eslint-disable @next/next/no-img-element */
import type { Talent } from "./TalentTree";
import styles from "./talent-tree.module.css";

const LEVEL_ICON = "/assets/images/icons/talent-level.webp";
const LOCK_ICON = "/assets/images/icons/lock.webp";
const MAX_LEVEL = 5;

export type TalentConnection = "down" | "down-left" | "down-right";

interface TalentNodeProps {
  talent: Talent;
  level: number;
  connection: TalentConnection | null;
  downstreamUnlocked: boolean;
  /** Editor mode: left click cycles the node level. */
  onCycle?: (id: number) => void;
  /** Editor mode: right click sets/clears the node level. */
  onMax?: (id: number) => void;
}

export function TalentNode({
  talent,
  level,
  connection,
  downstreamUnlocked,
  onCycle,
  onMax,
}: TalentNodeProps) {
  const locked = level === 0;
  const hasVertical = connection === "down";
  const hasLeft = connection === "down-left";
  const hasRight = connection === "down-right";
  const label = `${talent.name}, nivel ${level} de ${MAX_LEVEL}`;
  const editor = Boolean(onCycle);

  const colorClass = talent.bgClass.includes("blue")
    ? styles["bg--blue"]
    : talent.bgClass.includes("green")
      ? styles["bg--green"]
      : styles["bg--red"];

  const content = (
    <>
      {(hasLeft || hasRight) && (
        <span
          aria-hidden
          className={`${styles.connector} ${styles.diagonal} ${
            hasLeft ? styles["diagonal--left"] : styles["diagonal--right"]
          }`}
          data-active={!locked && downstreamUnlocked}
        />
      )}

      <span className={`${styles.bg} ${colorClass}`}>
        <img
          className={styles.icon}
          src={`/${talent.icon}`}
          alt=""
          width={64}
          height={64}
          draggable={false}
        />
        <span className={styles.levelBar} aria-hidden>
          {Array.from({ length: MAX_LEVEL }, (_, index) => (
            <img
              key={index}
              className={styles.star}
              src={LEVEL_ICON}
              alt=""
              width={16}
              height={16}
              data-on={index < level}
              draggable={false}
            />
          ))}
        </span>
      </span>

      {locked && <img className={styles.lock} src={LOCK_ICON} alt="" width={40} height={40} />}

      {hasVertical && (
        <span
          aria-hidden
          className={`${styles.connector} ${styles.vertical}`}
          data-active={!locked && downstreamUnlocked}
        />
      )}

      <span className={styles.name} aria-hidden>
        {talent.name}
      </span>

      {editor && level > 0 && <span className={styles.levelBadge}>{level}</span>}
    </>
  );

  if (onCycle) {
    return (
      <button
        type="button"
        className={styles.node}
        data-locked={locked}
        data-editor="true"
        aria-label={label}
        title={`${talent.name} · ${level}/${MAX_LEVEL} · clic para cambiar, clic derecho para máximo`}
        onClick={() => onCycle(talent.id)}
        onContextMenu={(event) => {
          event.preventDefault();
          onMax?.(talent.id);
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={styles.node}
      data-locked={locked}
      role="img"
      aria-label={label}
    >
      {content}
    </div>
  );
}
