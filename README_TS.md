# Limitless MCP Server (TypeScript)

TypeScript版のLimitless MCP Serverです。npxで実行できます。

## インストール

```bash
npm install -g limitless-mcp-server
```

または、npxで直接実行:

```bash
npx limitless-mcp-server
```

## 使用方法

### 環境変数の設定

```bash
export LIMITLESS_API_KEY=your-api-key-here
```

### MCP設定

`mcp_config.json`に以下の設定を追加:

```json
{
  "mcpServers": {
    "limitless": {
      "command": "npx",
      "args": ["limitless-mcp-server"],
      "env": {
        "LIMITLESS_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 開発

```bash
# 依存関係をインストール
npm install

# 開発モードで実行
npm run dev

# ビルド
npm run build

# 本番実行
npm start
```

## 機能

- `get_lifelogs`: Limitless APIからlifelogsを取得してMarkdown形式で出力
- 環境変数による認証
- TypeScript型安全性
- npxによる簡単実行

## 設定ファイル

`config/config.yml`でデフォルトのクエリパラメータを設定できます。