# Git Diff Reviewer

GitのdiffをAIで分析し、Pull Request用のレビューコメントを自動生成するCLIツールです。

## 機能

- Gitのdiffを解析してファイルごとの変更を分析
- AI（OpenAI GPT）を使用して変更の意図や懸念点を分析
- Pull Requestレビュー用のコメントを自動生成
- コンソール表示とMarkdown形式での出力をサポート

## インストール

```bash
cd git-diff-reviewer
npm install
npm run build
npm link
```

## セットアップ

OpenAI APIキーが必要です：

```bash
# 環境変数に設定
export OPENAI_API_KEY="your-api-key-here"

# または設定方法を確認
git-diff-reviewer setup
```

## 使用方法

### 基本的な使用方法

```bash
# 最新のコミットを分析
git-diff-reviewer analyze

# ステージされた変更を分析
git-diff-reviewer analyze --staged

# 特定のコミットを分析
git-diff-reviewer analyze --commit HEAD~1

# コミット範囲を分析
git-diff-reviewer analyze --range HEAD~3..HEAD

# diffファイルから分析
git-diff-reviewer analyze --file diff.txt
```

### 出力オプション

```bash
# Markdown形式で出力
git-diff-reviewer analyze --output markdown

# ファイルに保存
git-diff-reviewer analyze --save review.md --output markdown
```

### APIオプション

```bash
# APIキーを直接指定
git-diff-reviewer analyze --api-key "your-api-key"

# カスタムAPIエンドポイントを使用
git-diff-reviewer analyze --api-url "https://your-api-endpoint.com"
```

## 出力例

ツールは以下の情報を提供します：

- **全体的な要約**: 変更の概要とリスクレベル
- **ファイルごとの分析**:
  - 変更の概要
  - 変更の意図
  - 懸念点
  - 改善提案

## 開発

```bash
# 開発モードで実行
npm run dev

# ビルド
npm run build

# TypeScriptで直接実行
npm run dev -- analyze --help
```

## ライセンス

MIT