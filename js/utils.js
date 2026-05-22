export function formatStars(rating = 0) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export function fixImagePath(path) {
  return path.replace(/\\\\/g, "/");
}