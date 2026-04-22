import express from "express";
import dotenv from "dotenv";
import * as line from "@line/bot-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { detectMode, getSpecificDate, detectMealType } from "./services/parser.js";
import { buildHelpMessage } from "./services/formatters.js";

dotenv.config();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const app = express();

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mealsPath = path.join(__dirname, "data", "meals.json");

function loadMeals() {
  const raw = fs.readFileSync(mealsPath, "utf-8");
  return JSON.parse(raw);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMealByDate(dateString) {
  const meals = loadMeals();
  return meals.find((item) => item.date === dateString);
}

function bulletList(items) {
  return items.map((item) => `・${item}`).join("\n");
}

function buildMealText(title, items) {
  if (!items || items.length === 0) {
    return `${title}\nメニュー情報がありません。`;
  }
  return `${title}\n${bulletList(items)}`;
}

function buildAllMealsText(dateLabel, meal) {
  return (
    `${dateLabel}の食事はこちらです！\n\n` +
    `【朝食】\n${bulletList(meal.breakfast || [])}\n\n` +
    `【昼食】\n${bulletList(meal.lunch || [])}\n\n` +
    `【夕食】\n${bulletList(meal.dinner || [])}`
  );
}

function resolveRelativeTarget(mode) {
  const now = new Date();
  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (mode.startsWith("today_")) {
    return { date: formatDate(today), label: "今日" };
  }
  if (mode.startsWith("tomorrow_")) {
    return { date: formatDate(tomorrow), label: "明日" };
  }
  return null;
}

function formatJapaneseDate(dateString) {
  const [, month, day] = dateString.split("-");
  return `${Number(month)}月${Number(day)}日`;
}

app.get("/", (req, res) => {
  res.send("School meal bot is running.");
});

app.post("/webhook", line.middleware(config), async (req, res) => {
  try {
    const results = await Promise.all(req.body.events.map(handleEvent));
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return null;
  }

  const userText = event.message.text.trim();

  if (userText === "help" || userText === "ヘルプ") {
    return reply(event.replyToken, [buildHelpMessage()]);
  }

  const mode = detectMode(userText);

  if (mode === "unknown") {
    return reply(event.replyToken, [
      {
        type: "text",
        text:
          "使い方:\n" +
          "・今日のお昼ご飯は？\n" +
          "・今日の朝ごはんは？\n" +
          "・今日の夕食は？\n" +
          "・今日のご飯は？\n" +
          "・明日の昼食は？\n" +
          "・4/25 の昼ごはんは？\n" +
          "・4月18日の夕食は？",
      },
    ]);
  }

  if (mode === "specific_date") {
    const dateString = getSpecificDate(userText);
    const mealType = detectMealType(userText);
    const meal = getMealByDate(dateString);

    if (!meal) {
      return reply(event.replyToken, [
        {
          type: "text",
          text: `${formatJapaneseDate(dateString)}の食事データが見つかりませんでした。`,
        },
      ]);
    }

    let messageText = "";

    if (mealType === "breakfast") {
      messageText = buildMealText(`【${formatJapaneseDate(dateString)}の朝食】`, meal.breakfast);
    } else if (mealType === "lunch") {
      messageText = buildMealText(`【${formatJapaneseDate(dateString)}の昼食】`, meal.lunch);
    } else if (mealType === "dinner") {
      messageText = buildMealText(`【${formatJapaneseDate(dateString)}の夕食】`, meal.dinner);
    } else {
      messageText = buildAllMealsText(formatJapaneseDate(dateString), meal);
    }

    return reply(event.replyToken, [
      {
        type: "text",
        text: messageText,
      },
    ]);
  }

  const target = resolveRelativeTarget(mode);
  const meal = getMealByDate(target.date);

  if (!meal) {
    return reply(event.replyToken, [
      {
        type: "text",
        text: `${target.label}の食事データが見つかりませんでした。`,
      },
    ]);
  }

  let messageText = "";

  if (mode.endsWith("_breakfast")) {
    messageText = buildMealText(`【${target.label}の朝食】`, meal.breakfast);
  } else if (mode.endsWith("_lunch")) {
    messageText = buildMealText(`【${target.label}の昼食】`, meal.lunch);
  } else if (mode.endsWith("_dinner")) {
    messageText = buildMealText(`【${target.label}の夕食】`, meal.dinner);
  } else if (mode.endsWith("_all")) {
    messageText = buildAllMealsText(target.label, meal);
  }

  return reply(event.replyToken, [
    {
      type: "text",
      text: messageText,
    },
  ]);
}

async function reply(replyToken, messages) {
  return client.replyMessage({
    replyToken,
    messages,
  });
}

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});