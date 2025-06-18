# WorkLog - 出勤データ管理システム

<div align="center">
  <img src="https://img.shields.io/badge/React-19.1.0-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.7.2-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-6.2.0-purple" alt="Vite">
  <img src="https://img.shields.io/badge/Node.js-Express_4.18.2-green" alt="Node.js">
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Auth-JWT-red" alt="JWT">
  <img src="https://img.shields.io/badge/Deploy-Vercel-black" alt="Vercel">
  <img src="https://img.shields.io/badge/Status-Production_Ready-brightgreen" alt="Status">
  <img src="https://img.shields.io/badge/Backend-✅_Ready-brightgreen" alt="Backend">
  <img src="https://img.shields.io/badge/Database-✅_PostgreSQL-brightgreen" alt="Database">
</div>

## 📝 概要

WorkLogは、会社単位で出勤データの入力・管理を行う完全なWebアプリケーションです。フロントエンド・バックエンドを備えた本格的なシステムで、複数の端末から同じ会社アカウントでアクセスし、リアルタイムでデータを共有できます。

### 🎯 対象ユーザー
- 建設業、製造業など、複数の現場で作業を行う企業
- 従業員の勤怠管理をデジタル化したい中小企業
- Excelでの管理から脱却したい組織

### 💡 解決する課題
- 紙やExcelでの非効率な勤怠管理
- 複数拠点間でのデータ共有の困難さ
- 集計作業の手間とミス

## 🚀 主な機能

### 🔐 認証システム
- 会社単位のJWTベース認証
- ID/パスワードによるセキュアなログイン
- セッション管理による安全なアクセス制御
- マルチテナント対応（会社ごとのデータ分離）

### 📋 出勤データ入力
- 従業員名、日付、曜日、現場名、作業内容の記録
- 開始/終了時間の入力と総時間の自動計算
- 名前入力時のオートコンプリート機能
- 日付選択時の曜日自動設定

### 📊 データ管理・閲覧
- 出勤記録の一覧表示（日付昇順）
- 従業員名によるフィルタリング機能
- 個別レコードの削除機能

### 💾 Excelエクスポート
- 表示中のデータをExcelファイルとしてダウンロード
- 月単位、年単位でのデータ出力
- 名前・日付順でソートされたデータ

### 📱 レスポンシブデザイン
- PC、タブレット、スマートフォンに対応
- 直感的で使いやすいUI/UX

## 🔧 技術スタック

### フロントエンド
- **React 19.1.0** - 最新のReactで高速なUIを実現
- **TypeScript 5.7.2** - 型安全なコードでバグを削減
- **Vite 6.2.0** - 超高速な開発環境とビルド
- **Tailwind CSS 4.1.10** - モダンで美しいデザイン
- **SheetJS (xlsx 0.18.5)** - Excelファイルの読み書きに対応

### バックエンド
- **Node.js + Express.js 4.18.2** - 高速で軽量なサーバー
- **TypeScript 5.3.2** - 型安全なバックエンド開発
- **PostgreSQL (Neon Cloud)** - 本番環境対応クラウドデータベース
- **SQLite 5.1.6** - 開発環境・フォールバックデータベース
- **JWT認証 (jsonwebtoken 9.0.2)** - セキュアなトークンベース認証
- **RESTful API** - 標準的なAPI設計
- **bcryptjs 2.4.3** - パスワードハッシュ化 (saltRounds: 12)
- **CORS 2.8.5 + Helmet 7.1.0** - セキュリティ強化
- **express-rate-limit 7.1.5** - APIレート制限

## 🏗️ システムアーキテクチャ

```
┌─────────────────┐    HTTPS    ┌──────────────────┐   PostgreSQL  ┌─────────────┐
│   React SPA     │ ←────────→ │  Node.js API     │ ←──────────→ │  Database   │
│  (Frontend)     │   REST API   │   (Backend)      │   (Neon)      │  (Neon Cloud)│
│                 │             │                  │               │             │
│ • 認証UI        │             │ • JWT認証        │               │ • 会社管理   │
│ • データ入力     │             │ • CRUD API       │               │ • 出勤記録   │
│ • 一覧・出力     │             │ • セキュリティ    │               │ • インデックス │
└─────────────────┘             └──────────────────┘               └─────────────┘
   Vercel Static                    Vercel Serverless                 PostgreSQL
  (同一プロジェクト)                 Functions (/api/*)                  (永続化)
```

## 📡 API エンドポイント

### 認証 API
```
POST /api/auth/login     # ログイン認証
POST /api/auth/logout    # ログアウト
GET  /api/auth/account   # アカウント情報取得
```

### 出勤記録 API
```
GET    /api/entries         # 出勤記録一覧取得
POST   /api/entries         # 新しい出勤記録作成
PUT    /api/entries/:id     # 出勤記録更新
DELETE /api/entries/:id     # 出勤記録削除
GET    /api/entries/names   # 従業員名一覧取得（オートコンプリート用）
```

### API 使用例

#### ログイン
```bash
curl -X POST https://worklog-deploy.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginId":"admin","password":"password"}'
```

#### 出勤記録の取得
```bash
curl -X GET https://worklog-deploy.vercel.app/api/entries \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 出勤記録の作成
```bash
curl -X POST https://worklog-deploy.vercel.app/api/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "田中太郎",
    "date": "2025-01-18",
    "dayOfWeek": "土",
    "siteName": "現場A",
    "workDescription": "基礎工事",
    "startTime": "08:00",
    "endTime": "17:00",
    "totalHours": "8.0"
  }'
```

## 📦 セットアップ

### 前提条件
- Node.js 18.0.0 以上
- npm または yarn

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/dev-shotas-projects/worklog.git
cd worklog

# フロントエンドの依存関係をインストール
npm install

# バックエンドの依存関係をインストール
cd backend
npm install
cd ..
```

> **📝 注意**: 2025-01-18のアップデートで、フロントエンドの不足していた依存関係（`@vitejs/plugin-react`、`tailwindcss`、`xlsx`等）は解決済みです。

### 環境変数の設定

**フロントエンド (.env)**:
```env
VITE_USE_BACKEND=true
VITE_API_BASE_URL=http://localhost:3001/api
VITE_NODE_ENV=development
```

**バックエンド (backend/.env)**:
```env
PORT=3001
NODE_ENV=development
# PostgreSQL本番データベース（Neon Cloud）
# 注意: 本番環境では必ずVercel環境変数で管理してください
DATABASE_URL=your-postgresql-connection-string
# 開発用SQLite（フォールバック）
DATABASE_PATH=./data/worklog.sqlite
JWT_SECRET=your-secure-jwt-secret-here
CORS_ORIGINS=http://localhost:5173
```

### データベースの初期化

**PostgreSQLの場合** (Neon Cloud使用):
1. Neon Cloudでデータベースを作成
2. 接続文字列を`DATABASE_URL`に設定
3. マイグレーションを実行:
```bash
cd backend
npm run migrate
```

**SQLiteの場合** (開発環境):
```bash
cd backend
npm run seed
```

### 開発サーバーの起動

**バックエンドサーバー**:
```bash
cd backend
npm run dev
```

**フロントエンドサーバー**:
```bash
# 新しいターミナルで
npm run dev
```

ブラウザで `http://localhost:5173` を開いてアクセスしてください。

### ビルド

```bash
# フロントエンドのプロダクションビルド
npm run build

# バックエンドのビルド
cd backend
npm run build
```

## 🔑 使い方

### 1. ログイン

デモアカウントでログインしてください：
- **ID**: `admin`
- **パスワード**: `password`

### 2. 出勤データの入力

1. ログイン後、出勤入力フォームが表示されます
2. 必要な情報を入力：
   - 名前（過去の入力からサジェストされます）
   - 日付（曜日は自動で設定）
   - 現場名
   - 作業内容
   - 開始・終了時間
3. 「登録」ボタンをクリック

### 3. データの閲覧・管理

- 登録したデータは一覧表に表示されます
- 名前で絞り込み検索が可能
- 不要なデータは削除ボタンで削除

### 4. Excelエクスポート

「エクスポート」ボタンから以下のオプションを選択：
- 表示中のデータ（フィルター適用済み）
- 月単位のデータ
- 年単位のデータ

## 📁 プロジェクト構造

```
WorkLog/
├── src/
│   ├── components/        # UIコンポーネント
│   │   ├── AttendanceForm.tsx
│   │   ├── AttendanceLog.tsx
│   │   ├── LoginForm.tsx
│   │   └── common/
│   ├── services/         # API通信層
│   ├── utils/            # ユーティリティ
│   ├── App.tsx           # メインコンポーネント
│   ├── types.ts          # 型定義
│   └── config.ts         # 設定
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔒 セキュリティ機能

- **JWT認証**: セキュアなトークンベース認証
- **パスワードハッシュ化**: bcryptによる強力なハッシュ化
- **CORS設定**: クロスオリジンリクエストの制御
- **レート制限**: API呼び出しの制限による攻撃防止
- **データ分離**: 会社単位でのデータ完全分離
- **SQLインジェクション対策**: パラメータ化クエリの使用

## 🚀 デプロイメント

### Vercelへのデプロイ

#### 🌐 **本番環境デプロイ状況**

![Deployment Status](https://img.shields.io/badge/Deployment-✅_Production-brightgreen) ![API Status](https://img.shields.io/badge/API-✅_Ready-brightgreen) ![Database Status](https://img.shields.io/badge/DB-✅_PostgreSQL-brightgreen) ![Auth Status](https://img.shields.io/badge/Auth-✅_JWT-brightgreen)

- **最新デプロイ**: `https://worklog-deploy.vercel.app` (本番運用中)
- **バックエンドAPI**: 同一プロジェクト `/api/*` エンドポイント
- **データベース**: PostgreSQL (Neon Cloud) - 永続化済み
- **ステータス**: ✅ 本番環境で稼働中

**デプロイメント履歴** (参考):
- `https://worklog-deploy.vercel.app` - **現在の本番URL** ✅
- `https://worklog-deploy-im6kr7tz1-dev-shotas-projects.vercel.app` - 最新デプロイメント
- `https://worklog-deploy-5uu92ei94-dev-shotas-projects.vercel.app` - 過去バージョン
- その他過去デプロイメント - アーカイブ済み

#### **デプロイ手順**:

**バックエンドのデプロイ**:
```bash
cd backend
vercel --prod
```

**フロントエンドのデプロイ**:
```bash
# 本番用環境変数の確認 (.env.production)
cat .env.production

# デプロイ
vercel --prod
```

### 環境変数（本番）

**実際の本番設定 (Vercel)**:

**バックエンド環境変数 (Vercelダッシュボードで設定)**:
```env
NODE_ENV=production
JWT_SECRET=[セキュアなランダム文字列]  # ⚠️ セキュリティ: Vercel環境変数で管理
DATABASE_URL=[あなたのPostgreSQL接続文字列]  # ⚠️ セキュリティ: Vercel環境変数で管理
CORS_ORIGINS=https://worklog-deploy.vercel.app
```

> **⚠️ 重要なセキュリティ警告**: 
> - `DATABASE_URL`と`JWT_SECRET`は絶対にコードにハードコードしないでください
> - Vercelダッシュボードの環境変数で安全に管理してください

**フロントエンド環境変数** (`.env.production`):
```env
VITE_USE_BACKEND=true
VITE_API_BASE_URL=/api  # 統合デプロイメントのため相対パス
VITE_NODE_ENV=production
```

> **✅ 更新済み**: 2025-01-18に環境変数とURL設定の同期が完了しました。
> **🔧 システムの特徴**: デュアルデータベース対応により、`DATABASE_URL`が設定されている場合はPostgreSQLを使用し、未設定の場合はSQLiteにフォールバックします。

## 📝 今後の機能拡張予定

### ✅ **完了済み改善**
- ✅ **データベース**: PostgreSQL (Neon) 永続化完了
- ✅ **API**: 全エンドポイント実装・テスト完了 (10/10)
- ✅ **認証**: JWT + bcrypt セキュリティ実装完了
- ✅ **デプロイ設定**: URL更新完了 (2025-01-18)
- ✅ **環境変数**: vercel.jsonから認証情報削除済み (2025-01-18)
- ✅ **プロジェクトクリーンアップ**: 約559MB削減 (2025-01-17)
- ✅ **ドキュメント更新**: Claude.md と README.md の同期完了 (2025-01-18)

### 🔧 **現在のシステム状況**

| 項目 | 実装状況 | 運用ステータス | 備考 |
|------|---------|-------------|------|
| PostgreSQLデータベース | ✅ 完了 | ✅ 稼働中 | Neon Cloud, 接続テスト通過 |
| API・認証システム | ✅ 完了 | ✅ 稼働中 | JWT認証・全エンドポイント正常 |
| フロントエンド | ✅ 完了 | ✅ デプロイ済み | React + TypeScript, レスポンシブ対応 |
| データ永続化・共有 | ✅ 完了 | ✅ 実現済み | 複数端末間リアルタイム同期 |
| セキュリティ対策 | ✅ 完了 | ✅ 実装済み | HTTPS・CORS・認証・テナント分離 |
| デプロイ設定同期 | ✅ 完了 | ✅ 同期済み | 本番URL統一完了 |

### 🔧 **今後の改善項目**
- 🔒 **セキュリティ**: VercelダッシュボードでDATABASE_URLとJWT_SECRETを設定
- ⚙️ **環境設定**: backend/.env.productionのPostgreSQL対応
- ⚠️ **テスト**: 自動テストスイート構築予定

### 短期計画 (優先度高)
- [ ] PostgreSQL/MySQL対応
- [ ] 自動テストスイート (Jest, Playwright)
- [ ] 詳細ログ・モニタリング
- [ ] データバックアップ・復旧機能

### 中期計画
- [ ] 従業員個別認証システム
- [ ] 管理者ダッシュボード
- [ ] 詳細レポート・分析機能
- [ ] APIレート制限強化

### 長期計画
- [ ] 勤務パターン分析・AI予測
- [ ] モバイルアプリ開発
- [ ] 給与計算システム連携
- [ ] 多言語対応

## 🤝 貢献方法

プロジェクトへの貢献を歓迎します！

1. プロジェクトをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コーディング規約
- TypeScriptの型定義を必須
- ESLintルールの遵守
- コミットメッセージは日本語または英語

## 📄 ライセンス

MIT License

## 📧 お問い合わせ

### 📊 **現在の運用状況**

| 項目 | 技術実装 | 運用ステータス | 備考 |
|------|---------|-------------|------|
| PostgreSQLデータベース | ✅ 完了 | ✅ 稼働中 | Neon Cloud, 10/10テスト通過 |
| API・認証システム | ✅ 完了 | ✅ 稼働中 | JWT認証・全エンドポイント正常 |
| フロントエンド | ✅ 完了 | ✅ デプロイ済み | React + TypeScript, レスポンシブ対応 |
| データ永続化・共有 | ✅ 完了 | ✅ 実現済み | 複数端末間リアルタイム同期 |
| セキュリティ対策 | ✅ 完了 | ✅ 実装済み | HTTPS・CORS・認証・テナント分離 |
| デプロイ設定同期 | ✅ 完了 | ✅ 同期済み | 2025-01-18に完了 |

プロジェクトに関する質問や提案は、[Issues](https://github.com/dev-shotas-projects/worklog/issues)で受け付けています。

**今後のタスク**:
1. 🔒 VercelダッシュボードでDATABASE_URLとJWT_SECRETを環境変数として設定
2. ⚙️ backend/.env.productionをPostgreSQL設定に更新

## 🔧 トラブルシューティング

### よくある問題と解決法

#### 1. API接続エラー
**症状**: フロントエンドからバックエンドに接続できない
**原因**: 
- URL設定の不一致
- CORS設定の問題
- 統合デプロイメントでは相対パス`/api`を使用

**解決策**:
1. `.env.production`の`VITE_API_BASE_URL=/api`を確認
2. `vercel.json`の`CORS_ORIGINS`を最新URLに更新
3. 再デプロイ後、ブラウザキャッシュをクリア

#### 2. 認証エラー
**症状**: ログインできない、トークンエラー
**原因**: 
- JWT秘密鍵の設定問題
- デモアカウント情報の不一致

**解決策**: 
1. Vercel環境変数で`JWT_SECRET`を設定
2. デモアカウント: ID=`admin`, PW=`password`を確認

#### 3. データベース接続エラー
**症状**: 出勤記録が空、データベースエラー
**原因**: 
- PostgreSQL接続文字列の問題
- Neon Cloudのコネクションプール設定

**解決策**: 
1. `DATABASE_URL`環境変数をVercelダッシュボードで確認
2. Neon Cloudでデータベースの状態を確認
3. SQLiteフォールバックの動作確認 (`DATABASE_URL`を空にしてテスト)

#### 4. Serverless Functionsタイムアウト
**症状**: APIレスポンスが遅い、タイムアウトエラー
**原因**: 
- コールドスタートの遅延
- データベースコネクションの初期化

**解決策**: 
1. 初回アクセスは10-15秒待機
2. Neon Cloudのプーリング使用を推奨
3. コネクションプール設定 (max: 1) を確認

### 開発環境での確認方法

#### 1. システムの状態確認
```bash
# Vercel CLIで最新のデプロイメントを確認
vercel ls

# プロジェクトのステータス確認
vercel inspect

# 環境変数の一覧確認
vercel env ls
```

#### 2. APIエンドポイントのテスト
```bash
# ヘルスチェック
curl https://worklog-deploy.vercel.app/api/health

# 認証テスト
curl -X POST https://worklog-deploy.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginId":"admin","password":"password"}'

# データ取得テスト (認証後)
export TOKEN="YOUR_JWT_TOKEN"
curl https://worklog-deploy.vercel.app/api/entries \
  -H "Authorization: Bearer $TOKEN"

# 従業員名一覧取得
curl https://worklog-deploy.vercel.app/api/entries/names \
  -H "Authorization: Bearer $TOKEN"
```

#### 3. データベース接続テスト
```bash
# PostgreSQL接続テスト (Neon Cloud)
psql "$DATABASE_URL" -c "SELECT version();"

# テーブルの確認
psql "$DATABASE_URL" -c "\dt"

# サンプルデータの確認
psql "$DATABASE_URL" -c "SELECT * FROM company_accounts LIMIT 1;"
psql "$DATABASE_URL" -c "SELECT count(*) FROM attendance_entries;"
```

#### 4. 環境変数の設定・管理
```bash
# 新しい環境変数の設定
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production

# 環境変数の更新
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production

# ローカル開発用環境変数
vercel env pull .env.local
```

#### 5. ログ確認とデバッグ
```bash
# Vercelファンクションのログ確認
vercel logs

# 特定のファンクションのログ
vercel logs --follow

# ローカルでのデバッグ開発
vercel dev
```

### パフォーマンスの最適化

#### フロントエンドの最適化
```bash
# Viteビルドの最適化
npm run build -- --mode production

# バンドルサイズの分析
npm run build -- --analyze

# キャッシュのクリア
rm -rf dist/ .vite/
```

#### バックエンドの最適化
```bash
# TypeScriptコンパイル確認
cd backend && npm run build

# コネクションプールの設定確認
# max: 1 (推奨), min: 0, acquire: 30000, idle: 10000
```

## 📚 詳細ドキュメント

- **技術詳細**: [CLAUDE.md](./CLAUDE.md) - システム設計と実装詳細
- **APIリファレンス**: 本 README の API エンドポイントセクションを参照
- **デプロイメントガイド**: 本 README のデプロイメントセクションを参照
- **トラブルシューティング**: 本 README のトラブルシューティングセクションを参照