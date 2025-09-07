# touhoku-it-2025-hands-on
東北IT物産展のハンズオン資料

## 概要

このリポジトリはDocusaurusを使用して構築された静的サイトです。GitHub ActionsによってGitHub Pagesに自動デプロイされます。

## ローカル開発

```bash
cd website
npm install
npm start
```

開発サーバーは http://localhost:3000 で起動します。

## ビルド

```bash
cd website
npm run build
```

静的ファイルが `build/` ディレクトリに生成されます。

## デプロイ

### 初回設定

1. GitHubリポジトリの Settings → Pages にアクセス
2. Source を "GitHub Actions" に設定
3. mainブランチへのプッシュで自動的にデプロイが開始されます

### 自動デプロイ

mainブランチにプッシュすると、GitHub Actionsが自動的に実行され、サイトがGitHub Pagesにデプロイされます。

- デプロイ先URL: https://miucrescent.github.io/touhoku-it-2025-hands-on/
- ワークフローファイル: `.github/workflows/deploy.yml`

### デプロイ確認

デプロイの状況は以下で確認できます:
- GitHub リポジトリの Actions タブ
- 成功時にはGitHub Pagesの設定画面にデプロイされたURLが表示されます
