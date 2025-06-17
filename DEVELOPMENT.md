# 開発者向けガイド - WorkLog

このドキュメントは、WorkLogの開発環境をセットアップし、開発を始めるための詳細なガイドです。

## 📋 必要な環境

### システム要件
- **Node.js**: v18.0.0 以上
- **npm**: v8.0.0 以上 (Node.js と一緒にインストールされます)
- **Git**: バージョン管理
- **ブラウザ**: Chrome, Firefox, Safari など (開発者ツール対応)

### 推奨開発ツール
- **VSCode**: TypeScript、React開発に最適
- **Postman/Insomnia**: API テスト用
- **SQLite Browser**: データベース管理用

## 🚀 クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/dev-shotas-projects/worklog.git
cd worklog
```

### 2. 依存関係のインストール

```bash
# フロントエンドの依存関係をインストール
npm install

# バックエンドの依存関係をインストール
cd backend
npm install
cd ..
```

### 3. 環境変数の設定

**フロントエンド** (`.env`):
```bash
# .envファイルをコピー (既に存在します)
cp .env.example .env  # 必要に応じて

# 内容を確認・編集
cat .env
```

**バックエンド** (`backend/.env`):
```bash
# .envファイルをコピー
cd backend
cp .env.example .env

# 内容を確認・編集 (通常はデフォルトのままでOK)
cat .env
cd ..
```

### 4. データベースの初期化

```bash
cd backend
npm run seed  # デモデータの投入
cd ..
```

### 5. 開発サーバーの起動

**ターミナル1 (バックエンド)**:
```bash
cd backend
npm run dev
```

**ターミナル2 (フロントエンド)**:
```bash
npm run dev
```

### 6. アプリケーションにアクセス

- **フロントエンド**: http://localhost:5173
- **バックエンドAPI**: http://localhost:3001/api
- **ログイン情報**: ID=`admin`, パスワード=`password`

## 🏗️ プロジェクト構造

```
WorkLog/
├── src/                     # フロントエンドソース
│   ├── components/          # Reactコンポーネント
│   │   ├── AttendanceForm.tsx
│   │   ├── AttendanceLog.tsx
│   │   ├── LoginForm.tsx
│   │   └── common/          # 共通コンポーネント
│   ├── services/            # API通信レイヤー
│   ├── utils/               # ユーティリティ関数
│   ├── App.tsx              # メインアプリケーション
│   └── types.ts             # TypeScript型定義
├── backend/
│   ├── src/
│   │   ├── routes/          # APIルート
│   │   ├── services/        # ビジネスロジック
│   │   ├── middleware/      # 認証・エラーハンドリング
│   │   ├── config/          # データベース設定
│   │   └── scripts/         # 初期化スクリプト
│   ├── data/                # SQLiteデータベース
│   └── dist/                # ビルド出力
├── .env                     # フロントエンド環境変数
├── .env.production          # 本番環境設定
└── README.md                # 基本ドキュメント
```

## 🔧 開発ワークフロー

### コード変更の流れ

1. **ブランチ作成**:
   ```bash
   git checkout -b feature/新機能名
   ```

2. **コード変更**:
   - フロントエンド: `src/` 以下のファイルを編集
   - バックエンド: `backend/src/` 以下のファイルを編集

3. **リアルタイム確認**:
   - 両方の開発サーバーがファイル変更を自動検知
   - ブラウザが自動リロード

4. **ビルドテスト**:
   ```bash
   # フロントエンド
   npm run build
   
   # バックエンド
   cd backend
   npm run build
   ```

### データベース管理

**開発データリセット**:
```bash
cd backend
rm -f data/worklog.sqlite  # データベース削除
npm run seed               # 初期データ再作成
```

**データベース内容確認**:
```bash
cd backend/data
sqlite3 worklog.sqlite .tables  # テーブル一覧
sqlite3 worklog.sqlite "SELECT * FROM company_accounts;"  # アカウント確認
```

## 🧪 テスト

### 手動テスト項目

**認証機能**:
- [ ] ログイン成功/失敗
- [ ] トークンの自動更新
- [ ] ログアウト機能

**出勤管理機能**:
- [ ] 新規出勤記録の作成
- [ ] 記録一覧の表示
- [ ] フィルタリング機能
- [ ] Excelエクスポート
- [ ] 記録の削除

**マルチテナント**:
- [ ] 会社別データ分離
- [ ] 不正アクセス防止

### APIテスト

```bash
# ログインテスト
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginId":"admin","password":"password"}'

# 出勤記録取得テスト (要トークン)
curl -X GET http://localhost:3001/api/entries \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 よくある問題と解決法

### ポートが既に使用されている

```bash
# プロセスを確認
lsof -ti:3001  # バックエンドポート
lsof -ti:5173  # フロントエンドポート

# プロセスを終了
kill -9 $(lsof -ti:3001)
```

### データベース接続エラー

```bash
# データベースファイルの権限確認
ls -la backend/data/

# ディレクトリ作成
mkdir -p backend/data

# データベース再初期化
cd backend && npm run seed
```

### 環境変数が読み込まれない

```bash
# .envファイルの確認
cat .env
cat backend/.env

# ファイルの権限確認
ls -la .env*
ls -la backend/.env*
```

### TypeScriptエラー

```bash
# 型チェック
npm run build
cd backend && npm run build

# 型キャッシュクリア
rm -rf node_modules/.cache
rm -rf backend/node_modules/.cache
```

## 📝 新機能開発ガイド

### フロントエンド機能追加

1. **新しいコンポーネント作成**:
   ```tsx
   // src/components/NewComponent.tsx
   import React from 'react';
   
   interface Props {
     // プロパティ定義
   }
   
   export const NewComponent: React.FC<Props> = ({ }) => {
     return <div>新しいコンポーネント</div>;
   };
   ```

2. **API通信の追加**:
   ```typescript
   // src/services/apiService.ts に追加
   export const newApiFunction = async (): Promise<ResponseType> => {
     const response = await fetch(`${API_BASE_URL}/new-endpoint`, {
       headers: getAuthHeaders(),
     });
     return response.json();
   };
   ```

### バックエンドAPI追加

1. **新しいルート作成**:
   ```typescript
   // backend/src/routes/newRoute.ts
   import { Router } from 'express';
   import { authenticateToken } from '../middleware/auth';
   
   const router = Router();
   
   router.get('/new-endpoint', authenticateToken, async (req, res) => {
     try {
       // ロジック実装
       res.json({ success: true });
     } catch (error) {
       res.status(500).json({ error: 'Internal server error' });
     }
   });
   
   export default router;
   ```

2. **メインアプリに登録**:
   ```typescript
   // backend/src/app.ts に追加
   import newRoute from './routes/newRoute';
   app.use('/api', newRoute);
   ```

## 🚀 デプロイメント

### 本番環境への反映

1. **本番環境設定の更新**:
   ```bash
   # .env.production の確認
   cat .env.production
   cat backend/.env.production
   ```

2. **Vercelデプロイ**:
   ```bash
   # バックエンド
   cd backend
   vercel --prod
   
   # フロントエンド  
   cd ..
   vercel --prod
   ```

## 🤝 コントリビューション

開発に参加する際のガイドライン:

1. **コーディング規約**:
   - TypeScript必須
   - ESLint/Prettierに従う
   - 型安全性を重視

2. **コミットメッセージ**:
   ```
   feat: 新機能追加
   fix: バグ修正
   docs: ドキュメント更新
   refactor: リファクタリング
   ```

3. **プルリクエスト**:
   - 機能ごとにブランチを分ける
   - レビュー必須
   - テスト確認

## 📚 参考リンク

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Vercel Deployment](https://vercel.com/docs)
- [SQLite Documentation](https://www.sqlite.org/docs.html)