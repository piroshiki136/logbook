# 06. 画面仕様（Screen & Function Specification）

本章では、logbook における公開側・管理側の画面構成と、
各画面で必要となる UI 要素・動作・API 連携仕様をまとめる。

---

# 1. 公開側画面（Front）

## 1.0 MVP スコープ外の公開画面
- `/tags` と `/categories` は MVP では公開しない
- タグ一覧・カテゴリ一覧・タグ/カテゴリフィルタは MVP 完成後に実装する

## 1.1 Home（トップページ）
### UI 構成
- Hero セクション
  - 名前 / 肩書き
  - 簡単な自由紹介テキスト
- What I Do（任意）
  - 技術スタック・活動内容の簡易紹介
- 最新記事一覧（3件固定）
  - カード（タイトル / 日付 / カテゴリ / タグ）
- 「すべての記事を見る」ボタン（/articles）

### 動作仕様
- 最新記事カードクリック → 記事詳細ページへ遷移

### API
- GET /api/articles?limit=3
- 未認証の公開アクセスでは公開済み記事のみ取得する

---

## 1.2 Articles（記事一覧）
### UI構成
- 記事カード一覧
  - タイトル、日付、カテゴリ、タグ一覧
- ページネーション

### 動作仕様
- カードクリック → 記事詳細へ遷移
- ページ番号クリック → ページ遷移

### API
- GET /api/articles?page=
- 未認証の公開アクセスでは公開済み記事のみ取得する

### MVP スコープ注記
- タグ/カテゴリのフィルタバーは MVP では実装しない。
- フィルタ UI とクエリ連動（`tags` / `categories`）は MVP 完成後に再導入する。
- `/tags`, `/categories` の一覧導線も MVP では提供しない。

---

## 1.3 Article Detail（記事詳細）
### UI構成
- タイトル
- 作成日 / 更新日
- カテゴリ
- タグ（リンク付き）
- 本文（Markdown → HTML）
- 新しい記事 / 古い記事（ナビゲーション）

### 動作仕様
- 日時は `YYYY年MM月DD日 HH:mm`（24時間表記）で表示する
- MVP ではカテゴリ/タグは表示のみ（遷移なし）
- 新しい記事 / 古い記事クリックで該当記事へ遷移

### API
- GET /api/articles/{slug}
- 未認証の公開アクセスでは `isDraft=false` かつ `publishedAt!=null` の記事のみ取得する
- GET /api/articles/{id}/newer-older
- 未認証の公開アクセスでは `isDraft=false` かつ `publishedAt!=null` の記事のみ取得する

---

# 2. 管理側画面（Admin）

## 2.1 Login（GitHub OAuth）
### UI構成
- GitHub でログインボタン

### 動作仕様
- NextAuth の GitHub OAuth 認証を利用
- `callbackUrl` が `/admin` 配下の場合はその URL へ戻す
- `callbackUrl` 未指定または不正な場合は `/admin` へ遷移

---

## 2.1.1 Forbidden（権限なし）
### UI構成
- 権限なしメッセージ
- サインアウトボタン

### 動作仕様
- 許可されていないアカウントの場合に表示
- 許可判定は `ADMIN_ALLOWED_EMAILS` に含まれるメールアドレスで行う
- サインアウト後は /admin/login へ戻す

---

## 2.1.2 Admin Top（管理トップ）
### UI構成
- ログイン中ユーザー名
- ログイン中メールアドレス
- 記事管理ボタン（/admin/articles）
- 新規作成ボタン（/admin/articles/new）
- サインアウトボタン

### 動作仕様
- 管理画面の起点として利用する
- 記事管理 / 新規作成へ遷移できる

---

## 2.2 Admin Articles（記事一覧）
### UI構成
- 記事一覧
  - タイトル
  - 更新日
  - ステータス（公開 or Draft）
  - 編集ボタン（/admin/articles/[id]/edit）
- 表示切替タブ
  - All
  - Published
  - Draft
- 新規作成ボタン（/admin/articles/new）
- Admin トップへ戻るボタン（/admin）

### 動作仕様
- 編集ボタン → 編集画面へ遷移
- タブ切替に応じて API のクエリを変更（?draft=false / ?draft=true）
- Admin トップへ戻るボタン → `/admin` へ遷移
- 記事の公開停止は削除ではなく非公開化で対応する

### API
- GET /api/articles
- GET /api/articles?draft=false
- GET /api/articles?draft=true

---

## 2.3 New Article（記事作成）
### UI構成
- タイトル入力
- slug（任意入力。未入力時はサーバー側で自動生成）
- カテゴリ選択（string）
- タグ入力（カンマ区切り）
- Markdown エディタ
- 公開 / 非公開切り替えボタン
- 記事管理へ戻るボタン（/admin/articles）
- Admin トップへ戻るボタン（/admin）

### 動作仕様
- slug が空欄なら API の作成処理で title から自動生成する
- slug は手動編集可能
- 初期状態は非公開
- 保存後 → 編集画面へ遷移（/admin/articles/[id]/edit）
- API エラーはフォーム下部に表示
- 管理導線ボタンから `/admin` または `/admin/articles` へ戻れる

### 未実装 / 仕様差分
- タイトル入力に追従するクライアント側 slug 自動生成は未実装
- react-markdown によるプレビューは未実装
- 画像アップロード連携は MVP 対象外とし、後続フェーズで対応する

### API
- POST /api/articles

---

## 2.4 Edit Article（記事編集）
### UI構成
- New Article と同一
- 記事の既存内容が初期表示される

### 動作仕様
- 更新保存（公開 or 下書き）機能
- 管理導線ボタンから `/admin` または `/admin/articles` へ戻れる
- slug の更新可（ただし URL 変更に注意）

### 未実装 / 仕様差分
- 画像アップロード連携は MVP 対象外とし、後続フェーズで対応する

### API
- GET /api/articles/by-id/{id}
- PATCH /api/articles/{id}

---

# 3. 補足

## 認証制御
- /admin 配下は NextAuth の認証必須
- 未ログイン時 → /admin/login にリダイレクト
- 非許可メール時 → /admin/forbidden にリダイレクト

## 下書き管理
- articles.is_draft により制御
- 管理画面ではバッジ表示＋タブ切替により UI サポート

## 新旧記事
- API は `id` で対象記事を指定し、新旧判定は `updatedAt` の降順で行う
- `updatedAt` が同一の場合は `createdAt` 降順、さらに `id` 降順で決定する
