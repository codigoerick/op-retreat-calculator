import Image from "next/image";

interface TalentNodeProps {
  id: number;
  name: string;
  icon: string;
  bgClass: string;
  stars: number;
  unlocked: boolean;
  hasVerticalConnection?: boolean;
  hasDiagonalLeft?: boolean;
  hasDiagonalRight?: boolean;
  showVerticalBar?: boolean;
  showDiagonalLeftBar?: boolean;
  showDiagonalRightBar?: boolean;
}

export default function TalentNode({
  id,
  name,
  icon,
  bgClass,
  stars,
  unlocked,
  hasVerticalConnection,
  hasDiagonalLeft,
  hasDiagonalRight,
  showVerticalBar,
  showDiagonalLeftBar,
  showDiagonalRightBar,
}: TalentNodeProps) {
  return (
    <div className={`talent__node ${!unlocked ? "talent--locked" : ""}`} data-id={id}>
      <div className={`talent__bg ${bgClass}`}>
        <div className="talent__name">{name}</div>
        <img src={`/${icon}`} alt={name} className="talent__icon" />
        <div className="talent__level-bar">
          {[...Array(5)].map((_, i) => (
            <img
              key={i}
              src="/assets/images/icons/talent-level.webp"
              alt="level"
              className="talent__level-star"
              style={{ opacity: i < stars ? 1 : 0 }}
            />
          ))}
        </div>
        {!unlocked && (
          <img src="/assets/images/icons/lock.webp" alt="locked" className="talent__lock" />
        )}
      </div>

      {hasVerticalConnection && (
        <div className="connection__vertical__bg">
          <div className="connection__vertical__bar" style={{ display: showVerticalBar ? "block" : "none" }}></div>
        </div>
      )}

      {hasDiagonalLeft && (
        <div className="connection__diagonal__left__bg">
          <div className="connection__diagonal__left__bar" style={{ display: showDiagonalLeftBar ? "block" : "none" }}></div>
        </div>
      )}

      {hasDiagonalRight && (
        <div className="connection__diagonal__right__bg">
          <div className="connection__diagonal__right__bar" style={{ display: showDiagonalRightBar ? "block" : "none" }}></div>
        </div>
      )}
    </div>
  );
}
