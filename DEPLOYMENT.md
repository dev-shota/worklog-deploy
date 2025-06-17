# WorkLog Vercel デプロイメントガイド

## 概要
WorkLogアプリケーションは、フロントエンド（React + Vite）とバックエンド（Express + SQLite）の両方をVercelにデプロイできます。

## 事前準備

### 1. Vercel CLI のインストール
```bash
npm install -g vercel
```

### 2. Vercel ログイン
```bash
vercel login
```

## デプロイ手順

### Step 1: バックエンドのデプロイ

1. バックエンドディレクトリに移動
```bash
cd backend
```

2. Vercelにデプロイ
```bash
vercel --prod
```

3. 環境変数を設定
Vercelダッシュボードで以下を設定：
- `JWT_SECRET`: セキュアなランダム文字列
- `NODE_ENV`: `production`
- `DATABASE_PATH`: `/tmp/worklog.sqlite`
- `CORS_ORIGINS`: フロントエンドのVercel URL

4. デプロイ完了後、URLをメモ（例: https://your-backend.vercel.app）

### Step 2: フロントエンドのデプロイ

1. プロジェクトルートに戻る
```bash
cd ..
```

2. プロダクション用環境変数を更新
`.env.production`ファイルの`VITE_API_BASE_URL`をバックエンドのURLに更新：
```
VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

3. Vercelにデプロイ
```bash
vercel --prod
```

## 設定ファイル

### バックエンド (`backend/vercel.json`)
- TypeScriptビルド設定
- Express アプリケーション設定
- 環境変数設定

### フロントエンド (`vercel.json`)
- 静的サイトビルド設定
- SPA ルーティング設定

## 注意事項

1. **データベース**: Vercelの/tmpディレクトリは一時的です。本格運用には外部データベース（PlanetScale, Supabaseなど）を検討してください。

2. **環境変数**: 機密情報は必ずVercelダッシュボードで設定し、ソースコードにハードコードしないでください。

3. **CORS設定**: フロントエンドのURLをバックエンドのCORS設定に追加してください。

## ログイン情報

デフォルトログイン：
- ID: `admin`
- パスワード: `password`

## トラブルシューティング

### よくある問題

1. **CORS エラー**: バックエンドの`CORS_ORIGINS`環境変数にフロントエンドURLが正しく設定されているか確認

2. **API接続エラー**: フロントエンドの`VITE_API_BASE_URL`がバックエンドの正しいURLを指しているか確認

3. **認証エラー**: JWTシークレットが正しく設定されているか確認