export function buildHelpMessage() {
  return {
    type: "text",
    text:
      "使えるコマンド:\n" +
      "・今日のお昼ご飯は？\n" +
      "・今日の朝ごはんは？\n" +
      "・今日の夕食は？\n" +
      "・今日のご飯は？\n" +
      "・明日の昼食は？\n" +
      "・4/25 の昼ごはんは？\n" +
      "・4月18日の夕食は？",
  };
}
export function buildTextResult(title, body) {
  return {
    type: "text",
    text: `【${title}】\n${body}`,
  };
}

export function buildListFlex(title, items) {
  const contents = items.slice(0, 10).map((item) => ({
    type: "box",
    layout: "baseline",
    spacing: "sm",
    contents: [
      {
        type: "text",
        text: "•",
        flex: 0,
        size: "md",
      },
      {
        type: "text",
        text: item.label,
        wrap: true,
        size: "sm",
      },
    ],
  }));

  return {
    type: "flex",
    altText: title,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: title,
            weight: "bold",
            size: "lg",
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            spacing: "sm",
            contents,
          },
        ],
      },
    },
  };
}

export function buildScheduleFlex(title, items) {
  const contents = items.slice(0, 10).map((item) => ({
    type: "box",
    layout: "horizontal",
    spacing: "md",
    contents: [
      {
        type: "text",
        text: item.time,
        size: "sm",
        weight: "bold",
        flex: 2,
      },
      {
        type: "text",
        text: item.task,
        size: "sm",
        wrap: true,
        flex: 5,
      },
    ],
  }));

  return {
    type: "flex",
    altText: title,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: title,
            weight: "bold",
            size: "lg",
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            spacing: "md",
            contents,
          },
        ],
      },
    },
  };
}