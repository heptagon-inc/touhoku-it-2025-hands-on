import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // AWS画像処理ハンズオン専用のサイドバー
  handsonSidebar: [
    {
      type: 'doc',
      id: 'handson/index',
      label: '🚀 ハンズオン概要',
    },
    {
      type: 'doc',
      id: 'handson/preparation',
      label: 'Step 0: 事前準備・環境確認',
    },
    {
      type: 'category',
      label: '📚 実装ステップ',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'handson/s3-bucket',
          label: 'Step 1: S3バケット作成',
        },
        {
          type: 'doc',
          id: 'handson/dynamodb',
          label: 'Step 2: DynamoDB作成',
        },
        {
          type: 'doc',
          id: 'handson/lambda',
          label: 'Step 3: IAMロール作成',
        },
        {
          type: 'doc',
          id: 'handson/lambda-function',
          label: 'Step 4: Lambda関数作成',
        },
        {
          type: 'doc',
          id: 'handson/s3-event',
          label: 'Step 5: S3イベント設定',
        },
        {
          type: 'doc',
          id: 'handson/cloudfront',
          label: 'Step 6: CloudFront設定',
        },
        {
          type: 'doc',
          id: 'handson/test',
          label: 'Step 7: システムテスト',
        },
      ],
    },
    {
      type: 'category',
      label: '🛠️ サポート',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'handson/troubleshooting',
          label: 'Step 8: トラブルシューティング',
        },
        {
          type: 'doc',
          id: 'handson/cleanup',
          label: 'Step 9: 後片付け',
        },
      ],
    },
    {
      type: 'category',
      label: '🚀 拡張機能',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'handson/webp-extension',
          label: 'Step 13: WebP拡張機能',
        },
      ],
    },
  ],
};

export default sidebars;
