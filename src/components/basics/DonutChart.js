"use client";
import React from "react";

const DonutChart = ({ data }) => {
  // data = [{ label: "...", value: 0, color: "#xxxxxx" }, ...]

  const total = data.reduce((acc, item) => acc + item.value, 0);
  const radius = 60;
  const circleLength = 2 * Math.PI * radius;

  const getLength = (value) => (value / total) * circleLength;

  const getLabelPosition = (valueLength, offset) => {
    const labelRadius = radius + 35;
    const midpoint = offset + valueLength / 2;
    const angle = (midpoint / circleLength) * 2 * Math.PI - Math.PI / 2;

    const x = 100 + labelRadius * Math.cos(angle);
    const y = 100 + labelRadius * Math.sin(angle);

    return { x, y };
  };

  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" className="w-56 h-56">
        {/* Fondo */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#EEF2FF"
          strokeWidth="40"
        />

        {data.map((item, i) => {
          const len = getLength(item.value);
          const offset = accumulatedOffset;
          accumulatedOffset += len;

          return (
            <React.Fragment key={i}>
              {/* Segmento */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="40"
                strokeDasharray={`${len} ${circleLength - len}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 100 100)"
              />

              {/* Label */}
              {item.value > 0 &&
                (() => {
                  const { x, y } = getLabelPosition(len, offset);
                  return (
                    <text
                      key={`label-${i}`}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="14"
                      fontWeight="600"
                    >
                      {item.value}
                    </text>
                  );
                })()}
            </React.Fragment>
          );
        })}

        {/* Agujero */}
        <circle cx="100" cy="100" r="30" fill="#ffffff" />
      </svg>

      {/* Leyenda */}
      <ul className="mt-4 mb-4 flex gap-4 items-center text-sm">
        {data.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm block"
              style={{ background: item.color }}
            />
            <span className="text-gray-500">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DonutChart;
