# Live Comments for kintone

kintone で「n件の新着コメントがあります」のバナーが出たときに、自動でクリックして新着コメントを展開する Chrome 拡張です。

## このプロジェクトについて

これは作者個人のサイドプロジェクトです。サイボウズの**公式製品ではありません**。本リポジトリの内容はすべて作者個人の成果物および見解であり、サイボウズの見解を示すものではありません。

「kintone」はサイボウズ株式会社の登録商標です。本拡張機能が連携する対象を説明するためにのみ名称を使用しています。

## 対応ページ

- スレッド／スペースのコメント欄・旧UI（`.ocean-ui-comment-unread-notification`）
- スレッド／スペースのコメント欄・新UI（フロントエンド刷新でクラスがハッシュ化されたため `button[title*="新着コメントがあります"]` で検出）
- レコード詳細画面のコメント欄（`.new-arrival-comment-notification`）
- 通知画面の新着通知（`[class*="_newItemsButton_"]`）

## スクリプト

| コマンド         | 用途                                    |
| ---------------- | --------------------------------------- |
| `pnpm install`   | 依存をインストール                      |
| `pnpm start`     | watch モードで開発（`tsc --watch`）     |
| `pnpm build:dev` | 開発用ビルド（`dist/` 一式を生成）      |
| `pnpm build`     | 配布用ビルド（`dist/` + `archive.zip`） |

## Chrome への読み込み

1. `pnpm build:dev` を実行
2. `chrome://extensions` を開いてデベロッパーモードを ON
3. 「パッケージ化されていない拡張機能を読み込む」で **`dist/` ディレクトリ**を選択

`src/` を編集したら `pnpm build:dev` → `chrome://extensions` の更新ボタンを押す。

## 動作の仕組み

`MutationObserver` で対象コンテナを発見したら、各コンテナに専用 observer を装着して可視性（opacity）と件数テキストの変化を監視。**件数値もしくは可視状態が変わった瞬間** に 1 度だけクリックを発火します。同じ状態の二重クリックは抑止されます。
