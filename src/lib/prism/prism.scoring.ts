import type { PrismArchetypeId, PrismAxisX, PrismAxisY } from "./prism.types";

export type PrismAnswers = {
  q1: "Blank Page" | "Spreadsheet"; // Axis X: Blank Page = intuition, Spreadsheet = logic
  q2: "5-Year Vision" | "Pixel Perfect"; // Axis Y: 5-Year Vision = macro, Pixel Perfect = micro
  q3: "Cave" | "Pit"; // Variant: Cave = outer, Pit = inner
};

/**
 * Computes the Prism archetype based on user answers.
 * 
 * Logic Mapping:
 * - Macro + Intuition: Outer -> maverick, Inner -> conductor
 * - Macro + Logic: Outer -> pathfinder, Inner -> translator
 * - Micro + Logic: Outer -> architect, Inner -> alchemist
 * - Micro + Intuition: Outer -> auteur, Inner -> amplifier
 */
export function computePrismArchetype(answers: PrismAnswers): PrismArchetypeId {
  const axisX: PrismAxisX = answers.q1 === "Blank Page" ? "intuition" : "logic";
  const axisY: PrismAxisY = answers.q2 === "5-Year Vision" ? "macro" : "micro";
  const isOuter = answers.q3 === "Cave";

  if (axisY === "macro" && axisX === "intuition") {
    return isOuter ? "maverick" : "conductor";
  }
  if (axisY === "macro" && axisX === "logic") {
    return isOuter ? "pathfinder" : "translator";
  }
  if (axisY === "micro" && axisX === "logic") {
    return isOuter ? "architect" : "alchemist";
  }
  // Micro + Intuition
  return isOuter ? "auteur" : "amplifier";
}
