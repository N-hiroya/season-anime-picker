# Season Anime Picker

放送シーズンごとのアニメから視聴候補を選ぶWebアプリです。現在はM0（プロジェクト基盤）のみを実装しており、業務機能はまだありません。

## 必要環境

- Node.js 22 LTS
- npm

`.nvmrc` を利用する場合は、次のコマンドでバージョンを合わせられます。

```bash
nvm use
```

## セットアップ

```bash
npm install
npx playwright install chromium
```

PlaywrightのChromiumインストールは、E2Eテストを初めて実行する前に1度だけ必要です。

## 開発サーバー

```bash
npm run dev
```

起動後、[http://localhost:3000](http://localhost:3000) を開きます。

## 検証コマンド

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run test:e2e
npm run build
```

| コマンド               | 内容                         |
| ---------------------- | ---------------------------- |
| `npm run dev`          | 開発サーバーを起動           |
| `npm run build`        | production buildを作成       |
| `npm run start`        | production buildを起動       |
| `npm run lint`         | ESLintを実行                 |
| `npm run format`       | Prettierでファイルを整形     |
| `npm run format:check` | Prettierの差分を検査         |
| `npm run typecheck`    | TypeScriptの型検査           |
| `npm test`             | unit testを1回実行           |
| `npm run test:watch`   | unit testをwatchモードで実行 |
| `npm run test:e2e`     | ChromiumでE2Eテストを実行    |

## ディレクトリ

```text
public/                       静的ファイル
src/app/                      Next.js App Router
src/features/season-picker/   シーズン選択機能（M1以降）
tests/unit/                   unit test
tests/e2e/                    Playwright E2E test
```

詳細な要件と設計は `docs/requirements.md`、`docs/architecture.md`、実装順序は `docs/tasks.md` を参照してください。
