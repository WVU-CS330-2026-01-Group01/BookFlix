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

  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = getFill(star);

        return (
          <span
            key={star}
            className="star"
            onMouseMove={(e) => setHoverRating(getStarValue(e, star))}
            onMouseLeave={() => setHoverRating(null)}
            onClick={(e) => onChange?.(getStarValue(e, star))}
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
