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
    // 形態素解析で「～たい」表現を検出（肯定/否定両方）
    const { hasDesire, isNegative } = await morphologicalAnalyzer.analyze(message.content);

    if (hasDesire) {
      // 欲求表現から動詞部分を抽出
      const verb = await morphologicalAnalyzer.extractDesire(message.content);

      if (verb) {
        let response = "";
        
        // 肯定表現（～したい）の場合
        if (!isNegative) {
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
            // 動詞の基本形から条件形に変換（詳細版）
            let conditionalForm = "";
            
            // 一段動詞 (ichidan verbs) - 食べる、見る、etc.
            if (verb.endsWith("る") && ["え", "け", "せ", "て", "ね", "へ", "め", "れ"].some(e => verb.endsWith(e + "る"))) {
              conditionalForm = verb.slice(0, -1) + "れば";
            } 
            // 五段動詞 (godan verbs) - 各行の変換規則に従う
            else {
              const lastChar = verb.slice(-1);
              const stem = verb.slice(0, -1);
              
              switch (lastChar) {
                case "う":
                case "つ":
                case "る": // 五段動詞の「る」（例：取る、送る）
                  conditionalForm = stem + "れば";
                  break;
                case "く":
                  conditionalForm = stem + "けば";
                  break;
                case "ぐ":
                  conditionalForm = stem + "げば";
                  break;
                case "す":
                  conditionalForm = stem + "せば";
                  break;
                case "む":
                  conditionalForm = stem + "めば";
                  break;
                case "ぶ":
                  conditionalForm = stem + "べば";
                  break;
                case "ぬ":
                  conditionalForm = stem + "ねば";
                  break;
                default:
                  // 不明な動詞の場合はそのまま返す
                  conditionalForm = verb + "ば";
              }
            }
            
            response = `じゃあ${conditionalForm}ええやん`;
          }
        }
        // 否定表現（～したくない）の場合
        else {
          // 「する」の場合は名詞+する形式と判断し、元のメッセージから名詞を抽出
          if (verb === "する") {
            // 元のメッセージから「したくない」の前の部分を抽出
            const match = message.content.match(/(.*?)したくない/);
            if (match && match[1]) {
              response = `じゃあ${match[1]}しなかったらええやん`;
            } else {
              response = `じゃあしなかったらええやん`;
            }
          } 
          // 「する」以外の動詞の場合は、基本形から否定過去条件形に変換
          else {
            // 動詞の基本形から否定過去条件形に変換
            let negativeForm = "";
            
            // 一段動詞 (ichidan verbs) - 食べる、見る、etc.
            if (verb.endsWith("る") && ["え", "け", "せ", "て", "ね", "へ", "め", "れ"].some(e => verb.endsWith(e + "る"))) {
              negativeForm = verb.slice(0, -1) + "なかったら";
            } 
            // 五段動詞 (godan verbs) - 各行の変換規則に従う
            else {
              const lastChar = verb.slice(-1);
              const stem = verb.slice(0, -1);
              
              switch (lastChar) {
                case "う":
                case "つ":
                case "る": // 五段動詞の「る」（例：取る、送る）
                  negativeForm = stem + "らなかったら";
                  break;
                case "く":
                  negativeForm = stem + "かなかったら";
                  break;
                case "ぐ":
                  negativeForm = stem + "がなかったら";
                  break;
                case "す":
                  negativeForm = stem + "さなかったら";
                  break;
                case "む":
                  negativeForm = stem + "まなかったら";
                  break;
                case "ぶ":
                  negativeForm = stem + "ばなかったら";
                  break;
                case "ぬ":
                  negativeForm = stem + "ななかったら";
                  break;
                default:
                  // 不明な動詞の場合は基本形 + なかったら
                  negativeForm = verb + "なかったら";
              }
            }
            
            response = `じゃあ${negativeForm}ええやん`;
          }
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
