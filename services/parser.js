export function detectMode(text) {
  if (getSpecificDate(text)) return "specific_date";

  if (/今日.*朝/.test(text) || /今日の朝ごはん/.test(text) || /今日の朝食/.test(text)) return "today_breakfast";
  if (/今日.*昼/.test(text) || /今日のお昼/.test(text) || /今日の昼食/.test(text) || /今日の給食/.test(text)) return "today_lunch";
  if (/今日.*夜/.test(text) || /今日の夕食/.test(text) || /今日の晩ごはん/.test(text)) return "today_dinner";
  if (/今日.*ごはん/.test(text) || /今日のご飯/.test(text) || /今日の食事/.test(text)) return "today_all";

  if (/明日.*朝/.test(text) || /明日の朝ごはん/.test(text) || /明日の朝食/.test(text)) return "tomorrow_breakfast";
  if (/明日.*昼/.test(text) || /明日のお昼/.test(text) || /明日の昼食/.test(text) || /明日の給食/.test(text)) return "tomorrow_lunch";
  if (/明日.*夜/.test(text) || /明日の夕食/.test(text) || /明日の晩ごはん/.test(text)) return "tomorrow_dinner";
  if (/明日.*ごはん/.test(text) || /明日のご飯/.test(text) || /明日の食事/.test(text)) return "tomorrow_all";

  return "unknown";
}

export function getSpecificDate(text) {
  const match1 = text.match(/(\d{1,2})\/(\d{1,2})/);
  if (match1) {
    const month = String(match1[1]).padStart(2, "0");
    const day = String(match1[2]).padStart(2, "0");
    return `2026-${month}-${day}`;
  }

  const match2 = text.match(/(\d{1,2})月(\d{1,2})日/);
  if (match2) {
    const month = String(match2[1]).padStart(2, "0");
    const day = String(match2[2]).padStart(2, "0");
    return `2026-${month}-${day}`;
  }

  return null;
}

export function detectMealType(text) {
  if (/朝/.test(text) || /朝ごはん/.test(text) || /朝食/.test(text)) return "breakfast";
  if (/昼/.test(text) || /昼ごはん/.test(text) || /お昼/.test(text) || /昼食/.test(text) || /給食/.test(text)) return "lunch";
  if (/夜/.test(text) || /夕食/.test(text) || /晩ごはん/.test(text)) return "dinner";
  return "all";
}