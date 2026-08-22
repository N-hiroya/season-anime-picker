# M0 実施ログ

- 実施日: 2026-08-04
- 対象: M0 — プロジェクト基盤
- 作業ディレクトリ: `season-anime-picker`
- 実行環境: Node.js v24.2.0 / npm 11.3.0
- プロジェクト指定: Node.js 22以上25未満（`.nvmrc` は22）

## 1. 実施方針

- Next.js App Routerを使った、起動・検証可能な空アプリを作成する。
- M0では検索、フィルター、候補保存などの業務機能を実装しない。
- `docs/tasks.md` のM0が、当初の `docs/architecture.md` に記載された依存方針と矛盾していたため、具体的なM0タスクを優先した。
- 後続作業で `docs/architecture.md` を実装済み構成へ修正した。

## 2. 実装内容

### 2.1 プロジェクト基盤

- Next.js 16、React 19、TypeScript、App Routerを初期化した。
- Node.jsの対象バージョンを `package.json` の `engines` と `.nvmrc` に定義した。
- npmスクリプトとして `dev`、`build`、`start`、`lint`、`format`、`format:check`、`typecheck`、`test`、`test:watch`、`test:e2e` を定義した。
- `package-lock.json` を生成し、依存バージョンを固定した。

### 2.2 UI基盤

- Tailwind CSS 4とPostCSSを設定した。
- shadcn/uiを公式CLIで初期化した。
- shadcn/uiの設定を次の内容で確定した。
  - スタイル: `base-nova`
  - プリミティブ: Base UI
  - アイコン: Lucide
  - import alias: `@/*`
  - React Server Components: 有効
- 最小コンポーネントとしてButtonを追加し、公式ドキュメントの参照先を確認した。
- `globals.css` にshadcn/uiのセマンティックカラー、タイポグラフィ、角丸、境界線、影の基本トークンを設定した。
- 外部フォント取得に依存しないよう、フォントはシステムフォントへ統一した。
- 業務機能を持たない「準備中」のトップ画面を作成した。

### 2.3 静的ファイルとNext.js設定

- `s4.anilist.co` をNext Imageの `remotePatterns` に設定した。
- `public/cover-placeholder.svg` を追加した。
- `src/app/`、`src/features/season-picker/`、`public/`、`tests/unit/`、`tests/e2e/` の基本構成を作成した。

### 2.4 静的検査とフォーマット

- ESLintのflat configとNext.js推奨設定を導入した。
- Prettierとフォーマット確認用スクリプトを導入した。
- TypeScriptのstrict設定と `@/*` paths aliasを設定した。
- Next.js 16.3.0の生成するagent rulesを `AGENTS.md` に反映した。

### 2.5 unit test

- Vitest 4を設定し、デフォルト環境をNode.jsとした。
- Reactコンポーネント用にjsdom、React Testing Library、jest-dom matcherを導入した。
- `tests/setup.ts` で各テスト後の自動cleanupを設定した。
- DOM matcherとcleanupを確認する基盤テストを2件追加した。
- `--passWithNoTests` を指定し、業務テストが存在しない段階でもテストスイートを実行可能にした。

### 2.6 E2E test

- Playwright TestをChromiumのみで設定した。
- `webServer` でNext.js開発サーバーを自動起動するようにした。
- `baseURL` を `http://localhost:3000` に設定した。
- タイトルとトップ画面の見出しを確認するE2E smoke testを追加した。
- Playwright Chromium、Headless Shell、FFmpegを初回インストールした。

### 2.7 ドキュメント

- `README.md` に必要環境、セットアップ、起動、検証コマンド、ディレクトリ構成を記載した。
- `AGENTS.md` にformat、typecheck、E2Eコマンドを追記した。
- `docs/architecture.md` をTailwind CSS、shadcn/ui、React Testing Library、jsdomを採用する構成へ修正した。
- `docs/tasks.md` の実施済みM0タスクと検証項目へチェックを付けた。

## 3. 依存関係に関する判断と修正

### ESLint

ESLint 10では、Next.js 16.2系が使用する一部プラグインのpeer dependencyが未対応だった。互換性のあるESLint 9.39.5へ固定した。

### Next.js

当初はNext.js 16.2.12を使用したが、npm auditでNext.js配下のPostCSSとsharpにhigh severityの脆弱性が3件検出された。修正版のNext.js 16.3.0と `eslint-config-next` 16.3.0へ更新し、再監査で脆弱性0件を確認した。

### フォント

shadcn/ui初期化時に追加されたGoogle FontsのGeistは、ネットワーク制限下のproduction buildで取得できなかった。外部通信なしで再現可能にするため、`next/font/google` を削除してシステムフォントへ変更した。

## 4. 実行コマンド

### セットアップと確認

```bash
node --version
npm --version
npm view <package> version
npm install
npx shadcn@latest init --defaults
npx shadcn@latest info --json
npx shadcn@latest docs button
npx playwright install chromium
```

### フォーマット・静的検査・テスト

```bash
npm run format
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm audit --omit=dev --json
```

### 開発サーバーとブラウザーQA

```bash
npm run dev -- --hostname 127.0.0.1
```

アプリ内ブラウザーから `http://127.0.0.1:3000/` を開き、ページタイトル、見出し、再読み込み後の表示、横方向の溢れ、コンソールログを確認した。

## 5. 最終検証結果

最終結果はNext.js 16.3.0へ更新した後の実行結果である。

| 対象 | 結果 |
| --- | --- |
| 開発サーバー | 成功。約175msでReadyとなり、トップ画面へHTTP 200でアクセスできた |
| `npm run format:check` | 成功。対象ファイルはPrettier形式に一致 |
| `npm run lint` | 成功。ESLintエラーなし |
| `npm run typecheck` | 成功。TypeScriptエラーなし |
| `npm test` | 成功。1ファイル、2テストが成功 |
| `npm run build` | 成功。Next.js 16.3.0でコンパイルし、`/` を静的生成 |
| `npm run test:e2e` | 成功。Chromium smoke test 1件が成功 |
| ブラウザーQA | 成功。タイトルと見出しを確認し、再読み込み後も表示。横溢れとconsole warning/errorなし |
| `npm audit` | 0 vulnerabilities |
| `git diff --check` | 成功。空白エラーなし |

Playwright実行時に、実行環境の `NO_COLOR` と `FORCE_COLOR` の併用に関するNode.js警告が出力された。アプリケーションのconsole warning/errorではなく、テスト結果への影響はなかった。

## 6. 実行中に発生した問題

| 問題 | 対応 | 最終状態 |
| --- | --- | --- |
| ESLint 10とNext.js依存プラグインのpeer dependency警告 | ESLint 9.39.5へ固定 | 解消 |
| Google Fonts取得失敗によるbuild失敗 | システムフォントへ変更 | 解消 |
| sandbox内でTurbopackと開発サーバーがポートを確保できない | localhostを使用する検証を許可されたsandbox外で実行 | build・E2Eとも成功 |
| Playwright Chromiumが未インストール | `npx playwright install chromium` を実行 | 解消 |
| `127.0.0.1` とNext.js開発サーバー間のorigin警告 | PlaywrightのbaseURLとwebServer URLを `localhost` へ統一 | 解消 |
| Next.js 16.2.12配下にhigh severity脆弱性3件 | Next.js 16.3.0へ更新 | 0 vulnerabilities |

## 7. 未完了・対象外

- 承認済みビジュアルが提供されていないため、「承認済みビジュアルから基本トークンを定義する」は `docs/tasks.md` で未完了としている。
- 現在のトークンはshadcn/uiの初期テーマを基準とした基盤設定であり、承認済みビジュアルとの比較は行っていない。
- 検索、AniList API、フィルター、並び替え、候補保存などの業務機能はM1以降の対象であり、M0では実装していない。

## 8. 追加変更履歴

### 2026-08-12 — Vitestの既定環境をjsdomへ変更

- React hookを `renderHook` で検証しやすくするため、`vitest.config.ts` の既定環境をNode.jsからjsdomへ変更した。
- 既定環境と重複する `@vitest-environment jsdom` を基盤テストから削除した。
- `renderHook` と `act` を使用する基盤テストを追加した。
- Node.js固有の環境が必要なテストでは、ファイル単位で `@vitest-environment node` を指定する方針とした。
