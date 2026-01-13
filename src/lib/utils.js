export const formatName = (name) => {
  if (!name) return "...";
  const names = name.split(" ").filter((n) => n.length > 0);
  const firstTwo = names.slice(0, 2);
  return firstTwo
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
    .join(" ");
};
