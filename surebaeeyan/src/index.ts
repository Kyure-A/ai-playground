import { Client, Events, GatewayIntentBits, Message } from "discord.js";
import { config } from "./config";

// Discord クライアントの初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ボットが準備完了したときのイベント
client.once(Events.ClientReady, (readyClient: Client) => {
  console.log(`準備完了！ログイン: ${readyClient.user!.tag}`);
});

// メッセージが送信されたときのイベント
client.on(Events.MessageCreate, async (message: Message) => {
  // 自分自身のメッセージには反応しない
  if (message.author.bot) return;

  // 「～したい」「～してみたい」などのパターンを検出
  const desirePattern =
    /(.*?)(したい|してみたい|したいな|してみたいな)(\s|$|[、。!?！？])/;
  const match = message.content.match(desirePattern);

  if (match) {
    // 「～したい」の「～」の部分を抽出
    const action = match[1];

    // 「じゃあ～すればええやん」と返信
    if (action) {
      await message.reply(`じゃあ${action}すればええやん`);
    }
  }
});

// Discord にログイン
client.login(config.token);

// エラーハンドリング
client.on("error", (error: Error) => {
  console.error("Discord クライアントエラー:", error);
});

process.on("unhandledRejection", (error: unknown) => {
  console.error("未処理の拒否:", error);
});
