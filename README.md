# WorkLog - 出勤データ管理システム

<div align="center">
  <img src="https://img.shields.io/badge/React-19.1.0-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.7.2-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-Express-green" alt="Node.js">
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Auth-JWT-red" alt="JWT">
  <img src="https://img.shields.io/badge/Deploy-Vercel-black" alt="Vercel">
  <img src="https://img.shields.io/badge/Status-Config_Sync_Required-yellow" alt="Status">
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
- **Tailwind CSS (CDN)** - モダンで美しいデザイン
- **Vite** - 超高速な開発環境
- **SheetJS (XLSX)** - Excelファイルの読み書きに対応

### バックエンド
- **Node.js + Express.js** - 高速で軽量なサーバー
- **TypeScript** - 型安全なバックエンド開発
- **PostgreSQL (Neon)** - 本番環境対応クラウドデータベース
- **JWT認証** - セキュアなトークンベース認証
- **RESTful API** - 標準的なAPI設計
- **bcrypt** - パスワードハッシュ化
- **CORS + Helmet** - セキュリティ強化

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
# PostgreSQL本番データベース（自動検出）
DATABASE_URL=postgresql://user:pass@host:port/database
# 開発用SQLite（フォールバック）
DATABASE_PATH=./data/worklog.sqlite
JWT_SECRET=your-secure-jwt-secret-here
CORS_ORIGINS=http://localhost:5173
```

### データベースの初期化

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

![Deployment Status](https://img.shields.io/badge/Deployment-Config_Sync_Required-yellow) ![API Status](https://img.shields.io/badge/API-✅_Ready-brightgreen) ![Database Status](https://img.shields.io/badge/DB-✅_PostgreSQL-brightgreen) ![Auth Status](https://img.shields.io/badge/Auth-✅_JWT-brightgreen)

- **最新デプロイ**: `https://worklog-o9uzb6jxk-dev-shotas-projects.vercel.app`
- **バックエンドAPI**: 同一プロジェクト `/api/*` エンドポイント
- **データベース**: PostgreSQL (Neon Cloud) - 永続化済み
- **ステータス**: ⚠️ URL設定同期調整中

**過去のデプロイ履歴** (参考):
- `https://worklog-ahhmtvn2r-dev-shotas-projects.vercel.app`
- `https://worklog-hbfs8nea7-dev-shotas-projects.vercel.app`
- `https://worklog-7tddxlnkj-dev-shotas-projects.vercel.app`

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

**バックエンド環境変数 (vercel.json)**:
```env
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret-key
DATABASE_URL=postgresql://neondb_owner:***@ep-little-flower-a83l6gp5-pooler.eastus2.azure.neon.tech/worklog_prod?sslmode=require
CORS_ORIGINS=https://worklog-o9uzb6jxk-dev-shotas-projects.vercel.app
```

**フロントエンド環境変数** (`.env.production`):
```env
VITE_USE_BACKEND=true
VITE_API_BASE_URL=https://worklog-o9uzb6jxk-dev-shotas-projects.vercel.app/api
VITE_NODE_ENV=production
```

> **⚠️ 重要**: 現在URL設定の同期作業中です。上記設定で完全に動作します。

## 📝 今後の機能拡張予定

### ✅ **完了済み改善**
- ✅ **データベース**: PostgreSQL (Neon) 永続化完了
- ✅ **API**: 全エンドポイント実装・テスト完了 (10/10)
- ✅ **認証**: JWT + bcrypt セキュリティ実装完了

### 🔧 **現在の調整項目**
- ⚠️ **デプロイ設定**: URL同期調整中
- ⚠️ **環境変数**: 設定統一作業中
- ⚠️ **テスト**: 手動テストのみ → 自動テストスイート構築予定

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
| デプロイ設定同期 | ⚠️ 調整中 | ⚠️ URL同期待ち | 技術的準備完了、設定調整のみ |

プロジェクトに関する質問や提案は、[Issues](https://github.com/dev-shotas-projects/worklog/issues)で受け付けています。

## 🔧 トラブルシューティング

### よくある問題と解決法

#### API接続エラー
**症状**: フロントエンドからバックエンドに接続できない
**原因**: URL設定の不一致
**解決策**:
1. `.env.production`の`VITE_API_BASE_URL`を最新デプロイURLに更新
2. `backend/vercel.json`の`CORS_ORIGINS`を同じURLに更新
3. 両方再デプロイ

#### 認証エラー
**症状**: ログインできない、トークンエラー
**原因**: JWT秘密鍵の設定問題
**解決策**: Vercel環境変数で`JWT_SECRET`を設定

#### データが表示されない
**症状**: 出勤記録が空
**原因**: データベース接続問題
**解決策**: `DATABASE_URL`環境変数を確認

### 開発環境での確認方法
```bash
# API接続テスト
curl https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginId":"admin","password":"password"}'

# データベース接続テスト
curl https://your-app.vercel.app/api/entries \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📚 詳細ドキュメント

- **技術詳細**: [CLAUDE.md](./CLAUDE.md) - システム設計と実装詳細
- **デプロイガイド**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Vercelデプロイ手順
- **開発ガイド**: [DEVELOPMENT.md](./DEVELOPMENT.md) - 開発環境セットアップ