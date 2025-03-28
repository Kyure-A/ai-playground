import { Client, Events, GatewayIntentBits, Message } from "discord.js";
import { config } from "./config";
import { JapaneseMorphologicalAnalyzer } from "./morphological";

// 形態素解析器の初期化
const morphologicalAnalyzer = new JapaneseMorphologicalAnalyzer();

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

  try {
    // 形態素解析で「～たい」表現を検出
    const hasDesire = await morphologicalAnalyzer.analyze(message.content);

    if (hasDesire) {
      // 欲求表現から動詞部分を抽出
      const verb = await morphologicalAnalyzer.extractDesire(message.content);

      if (verb) {
        // 動詞の種類に応じて適切な応答を生成
        let response = "";
        
        // 「する」の場合は名詞+する形式と判断し、元のメッセージから名詞を抽出
        if (verb === "する") {
          // 元のメッセージから「したい」の前の部分を抽出
          const match = message.content.match(/(.*?)したい/);
          if (match && match[1]) {
            response = `じゃあ${match[1]}すればええやん`;
          } else {
            response = `じゃあすればええやん`;
          }
        } 
        // 「する」以外の動詞の場合は、基本形から条件形に変換
        else {
          // 動詞の基本形から条件形に変換（簡易版）
          const conditionalForm = verb.endsWith("る") 
            ? verb.slice(0, -1) + "れば" // 一段動詞 (ex: 食べる → 食べれば)
            : verb.slice(0, -1) + "えば"; // 五段動詞 (ex: 書く → 書けば)
          
          response = `じゃあ${conditionalForm}ええやん`;
        }
        
        await message.reply(response);
      }
    }
  } catch (error) {
    console.error("メッセージ処理エラー:", error);
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
