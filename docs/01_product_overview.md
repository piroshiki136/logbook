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
- 管理画面：NextAuth（Google OAuth）で保護
- バックエンド：FastAPI の REST API
- DB：PostgreSQL（Neon/Supabase）
- デプロイ：フロントは Vercel、バックは Railway/Render など
