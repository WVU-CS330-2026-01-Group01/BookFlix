import { useState } from "react";

function Rating({ value = 0, onChange }) {
  const [hoverRating, setHoverRating] = useState(null);

  const getStarValue = (e, starIndex) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = e.clientX - rect.left < rect.width / 2;
    return isHalf ? starIndex - 0.5 : starIndex;
  };

  const getFill = (star) => {
    const activeRating = hoverRating ?? value;

    if (activeRating >= star) return "100%";
    if (activeRating >= star - 0.5) return "50%";
    return "0%";
  };

  const handleKeyDown = (e, star) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange?.(star);
    }
  };

  return (
    <div className="stars" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = getFill(star);

        return (
          <span
            key={star}
            className="star"
            role="radio"
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            aria-checked={value >= star}
            tabIndex={0}
            onMouseMove={(e) => setHoverRating(getStarValue(e, star))}
            onMouseLeave={() => setHoverRating(null)}
            onFocus={() => setHoverRating(star)}
            onBlur={() => setHoverRating(null)}
            onClick={(e) => onChange?.(getStarValue(e, star))}
            onKeyDown={(e) => handleKeyDown(e, star)}
            style={{
              backgroundImage: `linear-gradient(to right, var(--medium-purple) ${fill}, gray ${fill})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
            }}
          >
            {"\u2605"}
          </span>
        );
      })}
    </div>
  );
}

export default Rating;
