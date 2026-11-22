# プロジェクトルール

## 目次

- [ディレクトリ構成](#ディレクトリ構成)
- [参照ドキュメント](#参照ドキュメント)
- [開発・検証コマンド](#開発検証コマンド)
- [作業ルール](#作業ルール)

## ディレクトリ構成

```text
docs/                         要件・設計・実装タスク
public/                       静的ファイル
src/
├── app/                      Next.js App Router
├── components/ui/            shadcn/uiコンポーネント
├── features/season-picker/   シーズン選択機能
└── lib/                      共通の基盤処理
tests/
├── unit/                     Vitest単体テスト
├── e2e/                      Playwright E2Eテスト
└── setup.ts                  単体テストの共通設定
```

機能固有の処理は `src/features/season-picker/` に配置する。
責務境界と今後の配置は [アーキテクチャ](docs/architecture.md) を参照する。

## 参照ドキュメント

- [README](README.md)：必要環境、セットアップ、ローカル起動
- [要件](docs/requirements.md)：MVPの範囲、期待する振る舞い、受け入れ条件
- [アーキテクチャ](docs/architecture.md)：採用技術、責務境界、データ契約、テスト方針
- [実装タスク](docs/tasks.md)：実装順序、チェックリスト、マイルストーンの完了条件

仕様は要件、実装方法はアーキテクチャを正とする。
依存バージョンと実行コマンドは [package.json](package.json) を確認する。

## 開発・検証コマンド

リポジトリルートで実行する。

| コマンド               | 内容                                 |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | 開発サーバーを起動                   |
| `npm run build`        | 本番用ビルドを作成                   |
| `npm run start`        | 本番用ビルドを起動                   |
| `npm run lint`         | ESLintで検査                         |
| `npm run format:check` | Prettierで書式を検査                 |
| `npm run typecheck`    | TypeScriptの型検査                   |
| `npm test`             | Vitest単体テストを1回実行            |
| `npm run test:e2e`     | PlaywrightでChromium E2Eテストを実行 |

初回セットアップとChromiumのインストール手順は [README](README.md) を参照する。
コマンドを変更した場合は、この表とREADMEも更新する。

## 作業ルール

- 要件・設計・依頼内容に、振る舞いや実装方針に影響する曖昧さがある場合は、実装前に `request_user_input` で確認する。軽微な命名、書式、既存規約から明確な事項は判断してよい。
- マイルストーンの進行と実装範囲は [実装タスク](docs/tasks.md) に従う。チェックは実装と必要な検証が完了した項目にだけ付ける。
- 動作変更・不具合修正には対応するテストを追加・更新する。配置と検証対象は [アーキテクチャのテスト方針](docs/architecture.md#6-テスト方針) に従う。
- 書式と静的検査の規則は [.prettierrc.json](.prettierrc.json) と [eslint.config.mjs](eslint.config.mjs) に従う。
