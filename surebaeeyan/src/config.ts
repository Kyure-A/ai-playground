import dotenv from "dotenv";

// .env ファイルから環境変数を読み込む
dotenv.config();

// 環境変数が設定されていない場合のエラーメッセージ
if (!process.env.DISCORD_TOKEN) {
  console.error("環境変数 DISCORD_TOKEN が設定されていません。");
  console.error(".env ファイルを作成し、DISCORD_TOKEN を設定してください。");
  console.error("例: DISCORD_TOKEN=your_discord_bot_token_here");
  process.exit(1);
}

// Discord Bot の設定
export const config = {
  // Discord Bot のトークン
  token: process.env.DISCORD_TOKEN,
};
