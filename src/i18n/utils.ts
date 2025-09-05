// src/i18n/utils.ts
import i18n from "./index";

/**
 * Format difficulty with translation
 */
export function formatDifficultyI18n(difficulty?: string | number): string {
  const t = i18n.t.bind(i18n);

  if (typeof difficulty === "number") {
    if (difficulty <= 2)
      return t("common.difficultyEasy", { defaultValue: "Easy" });
    if (difficulty <= 3)
      return t("common.difficultyMedium", { defaultValue: "Medium" });
    return t("common.difficultyHard", { defaultValue: "Hard" });
  }

  // Handle string values
  if (difficulty === "Easy")
    return t("common.difficultyEasy", { defaultValue: "Easy" });
  if (difficulty === "Medium")
    return t("common.difficultyMedium", { defaultValue: "Medium" });
  if (difficulty === "Hard")
    return t("common.difficultyHard", { defaultValue: "Hard" });

  return t("common.difficultyUnknown", { defaultValue: "Unknown" });
}

/**
 * Get algorithm category translation
 */
export function formatAlgorithmCategory(category: string): string {
  const t = i18n.t.bind(i18n);

  const categoryKey = `algorithms.${category}.title`;
  return t(categoryKey, { defaultValue: category });
}
