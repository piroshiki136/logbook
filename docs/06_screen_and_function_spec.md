# 06. 画面仕様（Screen & Function Specification）

本章では、logbook における公開側・管理側の画面構成と、
各画面で必要となる UI 要素・動作・API 連携仕様をまとめる。

---

# 1. 公開側画面（Front）

## 1.1 Home（トップページ）
### UI 構成
- Hero セクション
  - 名前 / 肩書き
  - 簡単な自由紹介テキスト
- What I Do（任意）
  - 技術スタック・活動内容の簡易紹介
- 最新記事一覧（3〜5件）
  - カード（タイトル / 日付 / カテゴリ / タグ）
- 「すべての記事を見る」ボタン（/articles）

### 動作仕様
- 最新記事カードクリック → 記事詳細ページへ遷移

### API
- GET /api/articles?limit=3

---

## 1.2 Articles（記事一覧）
### UI構成
- 記事カード一覧
  - タイトル、日付、カテゴリ、タグ一覧
- タグフィルタ（複数選択）
- カテゴリフィルタ（複数選択）
- ページネーション

### 動作仕様
- フィルタ選択 → クエリパラメータに反映
  `?tags=nextjs,fastapi&categories=web`
- カードクリック → 記事詳細へ遷移
- ページ番号クリック → ページ遷移

### API
- GET /api/articles?page=&tags=&categories=

---

## 1.3 Article Detail（記事詳細）
### UI構成
- タイトル
- 作成日 / 更新日
- カテゴリ
- タグ（リンク付き）
- 本文（Markdown → HTML）
- 前の記事 / 次の記事（ナビゲーション）

### 動作仕様
- タグクリック → /articles?tags=●● へ遷移
- カテゴリクリック → /articles?categories=●●
- 前の記事 / 次の記事クリックで該当記事へ遷移

### API
- GET /api/articles/{slug}
- GET /api/articles/{id}/prev-next（または articles?around=ID）

---

# 2. 管理側画面（Admin）

## 2.1 Login（GitHub OAuth）
### UI構成
- GitHub でログインボタン

### 動作仕様
- NextAuth の GitHub OAuth 認証を利用
- ログイン後 /admin/articles へ遷移

---

## 2.1.1 Forbidden（権限なし）
### UI構成
- 権限なしメッセージ
- サインアウトボタン

### 動作仕様
- 許可されていないアカウントの場合に表示
- サインアウト後は /admin/login へ戻す

---

## 2.2 Admin Articles（記事一覧）
### UI構成
- 記事一覧
  - タイトル
  - 更新日
  - ステータス（公開 or Draft）
  - 編集ボタン（/admin/articles/[id]/edit）
  - 削除ボタン（trash icon）
- 表示切替タブ
  - All
  - Published
  - Draft
- 新規作成ボタン（/admin/articles/new）

### 動作仕様
- 編集ボタン → 編集画面へ遷移
- 削除ボタン → ダイアログ表示 → OK → API → リロード
- タブ切替に応じて API のクエリを変更（?draft=false / ?draft=true）

### API
- GET /api/articles?draft=true
- DELETE /api/articles/{id}

---

## 2.3 New Article（記事作成）
### UI構成
- タイトル入力
- slug（自動生成＋手動修正可）
- カテゴリ選択（string）
- タグ複数選択
- Markdown エディタ
- プレビュー（react-markdown）
- 下書き保存 / 公開保存ボタン
- 画像アップロード（ローカル→URL挿入）

### 動作仕様
- タイトル入力 → 自動 slug 生成（小文字化 + 許可文字以外をハイフンに置換）
- slug は自由に編集可能
- 保存後 → 編集画面へ遷移（/admin/articles/[id]/edit）
- バリデーションエラーは入力欄下に表示

### API
- POST /api/articles
- POST /api/upload-image

---

## 2.4 Edit Article（記事編集）
### UI構成
- New Article と同一
- 記事の既存内容が初期表示される

### 動作仕様
- 更新保存（公開 or 下書き）機能
- 画像追加可能
- slug の更新可（ただし URL 変更に注意）

### API
- GET /api/articles/{id}
- PATCH /api/articles/{id}

---

# 3. 補足

## 認証制御
- /admin 配下は NextAuth の認証必須
- 未ログイン時 → /admin/login にリダイレクト

## 下書き管理
- articles.is_draft により制御
- 管理画面ではバッジ表示＋タブ切替により UI サポート

## 次・前の記事
- API で記事IDを基準に前後を取得する
（例：id の大小で判定）
