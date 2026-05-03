# 01. プロダクト概要（Product Overview）

## プロダクト名
**logbook**

## コンセプト
技術・趣味・学習ログ・動画紹介など幅広い内容を扱う
**個人の記録型ブログ（技術寄りの雑記ブログ）**。

Next.js（フロント）＋ FastAPI（バックエンド）の分離構成で開発。
実用性があり、かつポートフォリオとしても評価される Web アプリを目指す。

---

## 目的
- 技術記事の作成と整理
- 趣味・YouTube などの紹介
- 日々の学習の記録
- 就活ポートフォリオの強化

---

## 読者・利用者
- 一般公開（誰でも閲覧可能）
- 主な読者：サークルメンバー・知人
- 自分自身（学習記録）

---

## 運用方針
- フロント：Next.js による SSR/SSG
- 管理画面：NextAuth（GitHub OAuth）で保護
- バックエンド：FastAPI の REST API
- DB：PostgreSQL（Neon）
- デプロイ：フロントとバックエンドは Vercel、DB は Neon に統一する

## デプロイ構成メモ（2026-05-01 時点）
- 当面は独自ドメインを取得せず、プラットフォーム標準の URL を利用する
- フロントエンド公開 URL は `https://<project>.vercel.app` を利用する
- バックエンド公開 URL は同一 Vercel プロジェクト配下の `https://<project>.vercel.app/_/backend` を利用する
- バックエンドから DB へは Neon の接続文字列（`DATABASE_URL`）で接続する
- CORS は本番で `https://<project>.vercel.app` を許可し、開発用に `http://localhost:3000` も許可する
- Vercel 上に PostgreSQL を自前で建てず、DB は必ずマネージドサービスを利用する
- 本番構成は当面、Vercel / Neon を前提として変更しない

## 現在のデプロイ状況メモ（2026-05-04 時点）
- Vercel へのデプロイ作業は進行中
- 本番用の鍵と環境変数は Vercel frontend / backend へ登録済み
- 公開 URL は `https://logbook-flame.vercel.app` で確定した
- 本番 DB は Neon で作成済み。backend は `DATABASE_URL` で Neon に接続する
- Neon DB には Alembic マイグレーションを `head` まで適用済み
- 本番用 JWT 鍵（`JWT_PUBLIC_KEY` / `JWT_PRIVATE_KEY`）と frontend assertion 用鍵（`FRONTEND_ASSERTION_PRIVATE_KEY` / `FRONTEND_ASSERTION_PUBLIC_KEY`）は作成・登録済み
- `CORS_ALLOW_ORIGINS` は `https://logbook-flame.vercel.app` で設定済み
