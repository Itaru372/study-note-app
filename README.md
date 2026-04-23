# study-note-app

学習用ノートアプリです。ホーム画面からノートブックを作成・管理し、Markdown ノートを見開き UI で復習できます。

## セットアップ

```bash
npm install
npm run dev
```

## アーキテクチャ設計

- **構成**: Frontend SPA（React + TypeScript）  
- **状態管理層**: Zustand（ホーム状態、ノートブック管理、見開き遷移、隠し表示状態、表示回数）  
- **表示層**: HomeScreen / BookSpread / MarkdownPage / HiddenText / EditorPanel の責務分離  
- **永続化**: Zustand Persist で localStorage 保存（将来 API 永続化へ置換しやすい）

## 技術スタック選定理由

| 技術 | 採用理由 |
| --- | --- |
| React + TypeScript | UI 部品化・型安全・将来拡張がしやすい |
| Vite | 起動とビルドが高速で、開発体験が軽い |
| Zustand | 明確で最小な状態管理、Boilerplate が少ない |
| react-markdown + remark-gfm | 一般的 Markdown 表示に対応しやすい |

## ディレクトリ構成

```text
study-note-app/
├─ src/
│  ├─ components/
│  │  ├─ BookSpread.tsx
│  │  ├─ EditorPanel.tsx
│  │  ├─ HomeScreen.tsx
│  │  ├─ HiddenText.tsx
│  │  └─ MarkdownPage.tsx
│  ├─ store/
│  │  └─ useNoteStore.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ styles.css
│  └─ types.ts
├─ index.html
├─ package.json
└─ vite.config.ts
```

## 主要コンポーネント設計

- **HomeScreen**: ノートブック作成・一覧・名前変更・削除・オープン
- **BookSpread**: 左(奇数)/右(偶数)ページ配置、矢印遷移
- **MarkdownPage**: 1ページの Markdown 描画、選択 UI
- **HiddenText**: `**text**` 部分の隠し表示切替と表示回数カウント
- **EditorPanel**: ノートの作成・編集（タイトル/本文）
- **useNoteStore**: 全状態と操作を集約（ノートブック管理、ページ追加、編集、import、遷移、カウント）

## 最低限動作する実装範囲

- ホーム画面でノートブックの作成・管理・オープン
- ノート作成・編集（テキスト/Markdown）
- Markdown ファイル import（`---` で複数ページ分割）
- 太字を隠し表示に変換（クリック/タップで表示、回数可視化）
- 見開き UI（左奇数 / 右偶数、左右矢印遷移）
- PC/タブレット向けレスポンシブ対応
