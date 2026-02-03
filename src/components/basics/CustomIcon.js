"use client";
import React from "react";

export default function CustomIcon({
  path = "",
  size = 24,
  className = "",
  color = "currentColor",
  viewBox = "0 -960 960 960",
}) {
  if (!path) return null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      className={className}
      fill={color}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
