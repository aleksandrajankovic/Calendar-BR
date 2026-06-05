// src/app/fonts.js
import { Bebas_Neue, Rowdies, Russo_One } from "next/font/google";

export const rowdies = Rowdies({
  subsets: ["latin"],
  weight: "700",
});

export const russoOne = Russo_One({
  subsets: ["latin"],
  weight: "400",
});

export const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});
