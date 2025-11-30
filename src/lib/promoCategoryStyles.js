// src/lib/promoCategoryStyles.js

export const CATEGORY_GRADIENT_CLASSES = {
  SPORT: "bg-[linear-gradient(110.5deg,_#234919_2.58%,_#000000_92.56%)]",
  CASINO: "bg-[linear-gradient(110.5deg,_#59029D_2.58%,_#000000_92.56%)]",
  MISSIONS: "bg-[linear-gradient(110.5deg,_#4F2A17_2.58%,_#000000_92.56%)]",
  ALL: "bg-[linear-gradient(110.5deg,_#284755_2.58%,_#000000_92.56%)]",
};

// fallback ako stigne nešto čudno iz baze
export function getCategoryGradient(category) {
  const key = category || "ALL";
  return CATEGORY_GRADIENT_CLASSES[key] || CATEGORY_GRADIENT_CLASSES.ALL;
}

export function getCategoryLabel(category) {
  switch (category) {
    case "SPORT":
      return "Sport";
    case "CASINO":
      return "Casino";
    case "MISSIONS":
      return "Missions";
    case "ALL":
    default:
      return "All";
  }
}
