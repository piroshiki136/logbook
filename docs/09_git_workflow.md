# 09. Git ワークフロー（Git Workflow）

本ファイルは logbook プロジェクトの Git 運用ルールをまとめる。
必要に応じて後から詳細を追記する。

---

# 1. ブランチ戦略

## main
- 本番用のブランチ
- 常に動作する状態を維持する
- デプロイは main から行う

## dev
- 開発中コードを集約するブランチは dev の1本のみ
- feature ブランチで作業した内容は dev にマージする
- main に統合する前の確認を行う

## feature ブランチ
- 個別の機能や修正作業用のブランチ
- 名前例: feature/home-hero、feature/article-edit、feature/api-pagination
- dev から分岐し、作業後 dev にマージする
- マージ後は削除してよい

---

# 2. コミットメッセージ規則

コミットは次の prefix を付けて分類する。必要に応じて追加する。

- feat: 新機能
- fix: バグ修正
- refactor: 構造改善（挙動変更なし）
- docs: ドキュメント更新
- chore: 設定ファイル変更、依存追加など
- style: フォーマット・スタイル調整（ロジック変更なし）
- perf: パフォーマンス改善
- revert: 直前のコミットを巻き戻す

本文は日本語で書いてよい。
内容が明確であれば問題ない。

例:
feat: 記事一覧にページネーションを追加
fix: ヘッダーのレイアウト崩れを修正
refactor: 記事カードを小さなコンポーネントに分割
docs: URL 設計にタグクエリの説明を追加
chore: Biome の設定ファイルを追加
style: Biome でコードを整形（挙動変更なし）
perf: 記事一覧 API の N+1 を解消
revert: "feat: 記事一覧にページネーションを追加" を巻き戻し

---

# 3. プルリクエストの流れ
1. dev から feature ブランチを作成する
2. feature ブランチで作業し、コミットする
3. feature → dev にプルリクエストを作成する
4. dev の動作確認後、必要に応じて main へマージする

## PRテンプレートとチェック項目
- `.github/pull_request_template.md` を使用する
- 記載内容:
  - 概要（何を・なぜ、関連Issue/背景）
  - 関連ドキュメント（参照した docs/0x_xxx.md の章やセクション）
  - 実行したコマンド（チェックボックス）
    - `pnpm lint --filter frontend`
    - `pnpm test --filter frontend`（該当テストがあれば）
    - `uv run pytest backend/tests`
    - その他必要なコマンド
  - スクリーンショット（UI変更がある場合。なければ N/A）
  - Known Issues / 未解決事項（なければ N/A）
  - 影響範囲・リスク（DBマイグレーション有無、既存機能への影響、権限まわり等）

---

# 4. タグ運用
## 方針（シンプル運用、RCなし）
- 対象: 本番にデプロイする main のマージコミット
- タイミング: dev → main マージ直後に付与し、そのコミットを本番デプロイに使う
- 命名規則: `vYYYY.MM.DD` （例: `v2024.09.01`）
- コマンド例:
  - タグ付与: `git tag -a v2024.09.01 -m "release 2024-09-01"`
  - タグプッシュ: `git push origin v2024.09.01`
- ルール:
  - 本番タグは 1 リリースにつき 1 つ。付け替えず、新しいリリースは新タグで管理する
  - 同日に複数リリースする場合は `vYYYY.MM.DD-a`、`vYYYY.MM.DD-b` のように末尾に英字サフィックスを付けて区別する
  - dev で lint / テストを完了させたうえで main にマージし、同じコミットにタグを付ける
  - RC タグは運用しない。必要になれば別途ルールを追加する

## ホットフィックスの流れ
- ブランチ: `main` から `hotfix/<内容>` を作成し、最小修正を行う（`dev` は経由しない）
- テスト: `pnpm lint --filter frontend`、必要なフロントテスト、`uv run pytest backend/tests` を可能な範囲で実行
- マージ: `hotfix` → `main` にマージし、本番タグを付与
  - 同日複数リリースで `vYYYY.MM.DD` が重なる場合は `vYYYY.MM.DD-a`、`vYYYY.MM.DD-b` のように末尾に英字サフィックスを付けて区別する（例: `v2024.09.01-a`）
- 反映: `main` の同じコミットを `dev` にも取り込み、差分をなくす（`main` → `dev` マージ推奨）
