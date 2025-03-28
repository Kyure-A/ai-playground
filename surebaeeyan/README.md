# Discord Bot (TypeScript)

日本語の「～したい」「～してみたい」などの表現に反応して「じゃあ～すればええやん」と返信する Discord Bot です。

## 機能

- Discord サーバー内のメッセージをモニタリング
- 「～したい」「～してみたい」などの表現を検出
- 「じゃあ～すればええやん」という形式で返信

## 必要条件

- Node.js (v16.9.0 以上)
- npm または yarn
- Discord Bot トークン

## インストール

1. リポジトリをクローン、または ZIP ファイルをダウンロードして解凍します。

2. プロジェクトディレクトリに移動します：

   ```
   cd discord-bot-ts
   ```

3. 依存関係をインストールします：

   ```
   npm install
   ```

   または

   ```
   yarn install
   ```

4. `.env.example` ファイルを `.env` にコピーし、Discord Bot トークンを設定します：
   ```
   cp .env.example .env
   ```
   そして、`.env` ファイルを編集して `DISCORD_TOKEN` に実際のトークンを設定します。

## 使用方法

### 開発モード

```
npm run dev
```

または

```
yarn dev
```

### ビルドと実行

```
npm run build
npm start
```

または

```
yarn build
yarn start
```

## Discord Bot の設定

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセスします。
2. 「New Application」をクリックして新しいアプリケーションを作成します。
3. 「Bot」タブに移動し、「Add Bot」をクリックします。
4. 「TOKEN」セクションで「Copy」をクリックしてトークンをコピーします。
5. このトークンを `.env` ファイルの `DISCORD_TOKEN` に設定します。
6. 「OAuth2」タブに移動し、「URL Generator」を選択します。
7. 「SCOPES」で「bot」を選択し、「BOT PERMISSIONS」で必要な権限（最低限「Send Messages」と「Read Message History」）を選択します。
8. 生成された URL を使用して Bot を Discord サーバーに招待します。

## ライセンス

ISC
