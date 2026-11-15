import { Fragment, memo } from "react";
import talentsData from "@/data/talents.json";
import { TalentNode, type TalentConnection } from "./TalentNode";
import styles from "./talent-tree.module.css";

export interface Talent {
  id: number;
  name: string;
  icon: string;
  bgClass: string;
}

export type TalentConfig = Record<string, [number]>;

interface TalentTreeProps {
  config: TalentConfig | null;
  /** When provided, nodes become buttons that cycle their level (editor mode). */
  onCycle?: (id: number) => void;
  /** Optional right-click shortcut used by the panel. */
  onMax?: (id: number) => void;
  size?: "default" | "large" | "compact";
}

interface Row {
  row: number;
  single: boolean;
  talents: Talent[];
}

const TALENTS = talentsData as Talent[];
const TALENT_BY_ID = new Map(TALENTS.map((talent) => [talent.id, talent]));

// Rows go from the top of the in-game tree to the root node (id 0).
const ROWS: Row[] = [];
for (let rowIndex = 21; rowIndex >= 0; rowIndex--) {
  const ids = [rowIndex * 3 + 1, rowIndex * 3 + 2, rowIndex * 3 + 3];
  const rowTalents = ids
    .map((id) => TALENT_BY_ID.get(id))
    .filter((talent): talent is Talent => Boolean(talent));

  ROWS.push({
    row: 22 - rowIndex,
    single: false,
    talents: rowTalents,
  });
}

const rootTalent = TALENT_BY_ID.get(0);
if (rootTalent) {
  ROWS.push({ row: 23, single: true, talents: [rootTalent] });
}

function getDownstreamId(id: number): number | null {
  if (id === 0) return null;
  if (id === 1 || id === 2 || id === 3) return 0;
  return id - 3;
}

function getConnection(id: number): TalentConnection {
  if (id === 1) return "down-left";
  if (id === 3) return "down-right";
  return "down";
}

function isUnlocked(config: TalentConfig | null, id: number): boolean {
  return (config?.[id.toString()]?.[0] ?? 0) > 0;
}

export const TalentTree = memo(function TalentTree({
  config,
  onCycle,
  onMax,
  size = "default",
}: TalentTreeProps) {
  const sizeClass =
    size === "large"
      ? styles["tree--large"]
      : size === "compact"
        ? styles["tree--compact"]
        : "";

  return (
    <div className={`${styles.tree} ${sizeClass}`}>
      {ROWS.map((row) => (
        <div
          key={row.row}
          className={`${styles.row} ${row.single ? styles["row--single"] : ""}`}
        >
          {row.talents.map((talent, index) => {
            const previous = row.talents[index - 1];
            const level = config?.[talent.id.toString()]?.[0] ?? 0;
            const downstreamId = getDownstreamId(talent.id);
            const downstreamUnlocked =
              downstreamId !== null && isUnlocked(config, downstreamId);

            return (
              <Fragment key={talent.id}>
                {previous && (
                  <span
                    aria-hidden
                    className={`${styles.connector} ${styles.horizontal}`}
                    data-active={
                      isUnlocked(config, previous.id) && isUnlocked(config, talent.id)
                    }
                  />
                )}
                <TalentNode
                  talent={talent}
                  level={level}
                  connection={downstreamId === null ? null : getConnection(talent.id)}
                  downstreamUnlocked={downstreamUnlocked}
                  onCycle={onCycle}
                  onMax={onMax}
                />
              </Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
});
