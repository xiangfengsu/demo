const WebSocket = require("ws");
const fetch = require("node-fetch");
const ws = new WebSocket("wss://api.mango-bowl.com/v1/ws");

const feiShuBaseUrl =
  "https://open.larksuite.com/open-apis/bot/v2/hook/83f5bf85-6e5a-496b-a960-a8f81a0c7bfe";

// const feiShuBaseUrl =
//   "https://open.larksuite.com/open-apis/bot/v2/hook/fc49a00a-747c-45d7-9edd-6c44c1d9dcb7";

const sendMsgToFeiShu = async (data) => {
  try {
    const card = getFeiShuText(data);
    const payload = {
      msg_type: "interactive",
      card,
    };
    const response = await fetch(`${feiShuBaseUrl}`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "content-type": "application/json",
      },
    });
    const result = await response.text();
    console.log("feishu 通知状态---", result);
  } catch (error) {
    console.log("sendMsgToFeiShu error", error);
  }
};

const getFeiShuText = (data) => {
  const {
    type,
    market,
    timestamp,
    orderId,
    side,
    price,
    size,
    account,
    reason,
  } = data;

  // const title = type === 'open'?'下单':''
  let title = "跟单";
  if (type === "open") {
    title = "下单";
  } else {
    if (reason === "canceled") {
      title = "取消订单";
    }
    if (reason === "filled") {
      title = "成交";
    }
  }

  return {
    config: {
      wide_screen_mode: true,
    },
    elements: [
      {
        fields: [
          {
            is_short: true,
            text: {
              content: `** account ** \n ${account}`,
              tag: "lark_md",
            },
          },
          {
            is_short: true,
            text: {
              content: `** type **\n ${type}`,
              tag: "lark_md",
            },
          },
          {
            is_short: false,
            text: {
              content: "",
              tag: "lark_md",
            },
          },
          {
            is_short: true,
            text: {
              content: `** market **\n ${market}`,
              tag: "lark_md",
            },
          },
          {
            is_short: true,
            text: {
              content: `** side **\n ${side}`,
              tag: "lark_md",
            },
          },
          {
            is_short: false,
            text: {
              content: "",
              tag: "lark_md",
            },
          },
          {
            is_short: true,
            text: {
              content: `** price **\n ${price}`,
              tag: "lark_md",
            },
          },
          {
            is_short: true,
            text: {
              content: `** size **\n ${size}`,
              tag: "lark_md",
            },
          },
          {
            is_short: true,
            text: {
              content: `** timestamp **\n ${timestamp}`,
              tag: "lark_md",
            },
          },
          {
            is_short: false,
            text: {
              content: "",
              tag: "lark_md",
            },
          },
          {
            is_short: true,
            text: {
              content: `** orderId **\n ${orderId}`,
              tag: "lark_md",
            },
          },
        ],
        tag: "div",
      },
      {
        actions: [
          {
            tag: "button",
            text: {
              content: "跟单",
              tag: "plain_text",
            },
            type: "primary",
            url: "https://trade.mango.markets/zh",
          },
        ],
        tag: "action",
      },
    ],
    header: {
      template: "red",
      title: {
        content: title,
        tag: "plain_text",
      },
    },
  };
};

const address = "D1dfYRWb57WyJgbPhFGpUTwjDQZJvpKqZSA97Xhf7bW4";
// 4rm5QCgFPm4d37MCawNypngV4qPWv4D5tw57KE2qUcLE
// 9Z7ts8g29L5XnamRrLsSaNT3A1ZiCS8E2npyKWw3jrw6
ws.onmessage = (message) => {
  // console.log(JSON.parse(message.data));
  const result = JSON.parse(message.data);
  const {
    type,
    market,
    timestamp,
    orderId,
    clientId,
    side,
    price,
    size,
    account,
    reason,
  } = result;
  if (type === "open") {
    if (account === address) {
      // console.log(result);
      sendMsgToFeiShu(result);
    }
  }
  if (type === "done") {
    if (account === address) {
      console.log(result);
      sendMsgToFeiShu(result);
    }
  }
};

ws.onopen = () => {
  // subscribe both to trades and level2 real-time channels
  //   const subscribeTrades = {
  //     op: "subscribe",
  //     channel: "trades",
  //     markets: ["MNGO-PERP", "SOL-PERP"],
  //   };
  console.log("ws 连接成功");

  const subscribeL3 = {
    op: "subscribe",
    channel: "level3",
    markets: ["MNGO-PERP", "SOL-PERP"],
  };

  // ws.send(JSON.stringify(subscribeTrades))
  ws.send(JSON.stringify(subscribeL3));
};

// sendMsgToFeiShu();
