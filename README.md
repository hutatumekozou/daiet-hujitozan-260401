# Fuji Climb Diet

富士山登山メタファーで「毎日の小さな前進」を見える化する、AI ダイエット伴走アプリです。  
短期の追い込みではなく、2026/4/1 から 2026/9/30 に向けて、継続・可視化・再開しやすさを優先した MVP を実装しています。

現在は Vercel 本番対応のため、DB は SQLite ではなく PostgreSQL 前提です。

## 実装計画

1. Next.js 16 / TypeScript / Tailwind CSS / Prisma / PostgreSQL の基盤構築
2. Prisma schema と PostgreSQL マイグレーション
3. ダミーデータ先行で主要画面を実装
4. 進捗スコア算出と週間集計ロジックを実装
5. AI コーチの抽象化レイヤーを実装
6. OpenAI 接続を差し替え可能な adapter として実装
7. 空状態・エラー・モバイル UI を調整
8. README とローカル起動手順を整備

## ディレクトリ構成

```text
.
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ public/
│  └─ icon.svg
├─ src/
│  ├─ app/
│  │  ├─ api/coach/
│  │  ├─ analytics/
│  │  ├─ checkin/
│  │  ├─ dashboard/
│  │  ├─ history/
│  │  ├─ onboarding/
│  │  ├─ plan/
│  │  ├─ settings/
│  │  ├─ actions.ts
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ manifest.ts
│  ├─ components/
│  │  ├─ analytics/
│  │  ├─ forms/
│  │  ├─ layout/
│  │  ├─ plan/
│  │  └─ ui/
│  └─ lib/
│     ├─ coach/
│     ├─ server/
│     ├─ analytics.ts
│     ├─ constants.ts
│     ├─ date.ts
│     ├─ prisma.ts
│     ├─ schemas.ts
│     ├─ scoring.ts
│     └─ utils.ts
├─ .env.example
└─ package.json
```

## Prisma Schema

MVP では以下のモデルを実装しています。

- `UserProfile`
- `AppSettings`
- `DailyCheckin`
- `DailyPlan`
- `ActivityLog`
- `ProgressScoreLog`
- `WeeklySummary`
- `CoachMessage`
- `GoalSnapshot`

特徴:

- 単一ユーザー前提の構成
- 日次記録と派生ログを分離
- 進捗スコアの配点は `AppSettings` で調整可能
- AI は `DailyPlan` と `CoachMessage` に保持
- 本番では PostgreSQL、Vercel では静的化を無効化

## 主要画面

- `/onboarding`
  - 初期プロフィール設定
- `/dashboard`
  - 富士山進捗、現在地、今日の達成、連続記録、今週の前進量
- `/checkin`
  - 毎日の体重・睡眠・体調・食欲リスク・運動記録
- `/plan`
  - AI が返した今日のメニュー、B プラン、食事アドバイス
- `/history`
  - 日別ログ、週別サマリー、前進/後退履歴
- `/analytics`
  - 体重推移グラフ、週間前進量、暴食トリガー傾向
- `/settings`
  - 配点調整、AI トーン、AI プロバイダ切替

## 初期データ

`prisma/seed.ts` は初期プロフィールと設定だけを投入します。

- 開始体重 `63kg`
- 開始体脂肪率 `23%`
- 目標体重 `55kg`
- 目標体脂肪率 `17%`

初期状態は以下です。

- 連続記録 `0日`
- 今日の前進 `0m`
- 今週の前進 `0m`
- 現在地の標高 `0m`

## AI 接続方針

AI 呼び出しは `src/lib/coach/` 配下で adapter 化しています。

- `generateDailyPlan(input)`
- `generateWeeklySummary(input)`

構成:

- `mock-adapter.ts`
  - ローカル確認用のモック応答
- `openai-adapter.ts`
  - OpenAI Responses API を利用
- `index.ts`
  - `AppSettings.aiProvider` または環境変数で切替

将来は Anthropic や Gemini などを追加しても、画面や業務ロジックをほぼ触らず差し替え可能です。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数

```bash
cp .env.example .env
```

ローカルでも本番でも `DATABASE_URL` は PostgreSQL 接続文字列にしてください。  
`mock` で動かすだけなら `OPENAI_API_KEY` は不要です。

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/fuji_climb_diet?schema=public"
DATABASE_URL_UNPOOLED=""
DIRECT_URL=""
AI_PROVIDER="mock"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5-mini"
```

`DIRECT_URL` は任意です。未設定なら Prisma CLI は `DATABASE_URL_UNPOOLED`、それも無ければ `DATABASE_URL` を使います。

設定確認:

```bash
npm run env:check
```

### 3. DB 初期化

```bash
npm run db:migrate -- --name init
npm run db:seed
```

`db:seed` は本番で再実行しても既存ユーザーを削除しない、安全な初期投入用の挙動です。

まとめて作り直す場合:

```bash
npm run db:reset
```

### 4. 開発サーバ起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。  
`3000` が使用中なら Next.js が別ポートに退避します。

## Vercel 本番設定

SQLite は Vercel の永続 DB として使えないため、本番は PostgreSQL を使います。

推奨:

- `DATABASE_URL` に本番 PostgreSQL の接続文字列を設定
- Prisma CLI の direct 接続は `DIRECT_URL` を優先し、未設定なら `DATABASE_URL_UNPOOLED` を使う
- Build Command は `npx prisma generate && npx prisma migrate deploy && npm run build`

このリポジトリには [vercel.json](/Users/kukkiiboy/Desktop/Codex/★260303富士山ダイエットアプリ/vercel.json) を追加済みです。

Neon を使う場合の想定:

- `DATABASE_URL`: pooled 接続文字列
- `DATABASE_URL_UNPOOLED`: direct 接続文字列
- `DIRECT_URL`: 任意。手動上書きが必要なときだけ使う

Vercel の Neon integration は `DATABASE_URL` と `DATABASE_URL_UNPOOLED` を自動注入します。  
このリポジトリでは Prisma CLI が `DIRECT_URL` → `DATABASE_URL_UNPOOLED` → `DATABASE_URL` の順で解決するため、通常は Vercel 側で `DIRECT_URL` を手動追加する必要はありません。

初回投入の流れ:

```bash
npm run env:check
npm run db:deploy
npm run db:seed
```

### 本番更新手順

```bash
vercel --prod
vercel env pull .env.production.local --environment=production
set -a && source .env.production.local && set +a
npm run env:check
npm run db:deploy
```

seed を追加した直後だけ、必要に応じて以下を実行します。

```bash
npm run db:seed
```

更新後の確認ポイント:

- `/onboarding`
- `/checkin`
- `/history`

Deploy Logs で以下が出ていることを確認してください。

- `Running "npx prisma generate && npx prisma migrate deploy && npm run build"`
- `Datasource "db": PostgreSQL database`

runtime で 500 が出た場合の優先確認:

- Vercel env に `DATABASE_URL` と `DATABASE_URL_UNPOOLED` が入っているか
- `npm run env:check` で `DIRECT_URL source: DATABASE_URL_UNPOOLED` になっているか
- Deploy Logs で `prisma generate` が実行されているか
- Runtime Logs に `the URL must start with the protocol file:` が出ていないか

最後のエラーは、Prisma Client が古い SQLite schema のまま build に残っているときの典型症状です。

## 本番確認の基準

本番 URL:

- `https://daiet-hujitozan-web.vercel.app`

DB 依存ページは `force-dynamic` にしてあるため、Vercel 側で静的キャッシュされず、保存後の最新状態を表示する想定です。

## AI を実際に使う方法

1. `.env` の `OPENAI_API_KEY` を設定
2. `AI_PROVIDER=openai` に変更
3. 必要なら `OPENAI_MODEL` を変更
4. `npm run dev` を再起動

設定画面でも `AI Provider` を `OpenAI` に変更できます。  
API キー未設定時は自動的にモックへフォールバックします。

## 進捗スコアの考え方

デフォルト配点例:

- ジムへ行った: `+30m`
- 提案メニュー完了: `+40m`
- B プラン実施: `+15m`
- 体重記録: `+5m`
- チェックイン基礎点: `+5m`
- 暴飲暴食なし: `+10m`
- 良い外食選択: `+10m`
- 歩数ボーナス: `+10m`
- 暴飲暴食: `-20m`
- 無断スキップ: `-15m`
- ただし活動した日は `minimumActiveDayMeters` で最低ラインを救済

## MVP で実装済みのロジック

- 日次の進捗スコア算出
- スキップ日の減点
- 累積標高の再計算
- 週間サマリーの生成
- AI プロンプト生成
- AI レスポンスの Zod 検証
- 空データ時の分岐表示

## 今後の拡張案

- チャット形式の AI 相談
- 食事写真アップロード
- 感情ログ分析
- Apple Health 連携
- リマインド通知
- バッジ演出
- ジム通いの自動集計
