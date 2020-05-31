import { DevconCard } from "../types";

export const computeCardSize = (card: DevconCard): number => {
  return typeof card.getCardSize === "function" ? card.getCardSize() : 1;
};
