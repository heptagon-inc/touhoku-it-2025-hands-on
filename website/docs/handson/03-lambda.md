---
sidebar_position: 5
title: Step 3 - IAMロール作成
description: Lambda関数用のIAMロールと権限を設定する
---

# 🔐 Step 3: IAMロール作成

## ⏱️ このステップの所要時間
**約10分**

## 🎯 このステップのゴール
- Lambda関数用のIAMロールを作成する
- S3とDynamoDBへのアクセス権限を設定する
- セキュリティのベストプラクティスを学ぶ

---

## 📚 IAMロールとは？

**IAM（Identity and Access Management）ロール** は、AWSリソースが他のAWSサービスにアクセスするための権限を管理する仕組みです。

:::info 💡 IAMロールの特徴
- **権限の委譲**: サービス間で安全に権限を委譲
- **最小権限の原則**: 必要最小限の権限のみを付与
- **一時的な認証情報**: 長期間有効なアクセスキー不要
- **監査可能**: すべてのアクセスがログに記録
:::

今回作成するIAMロールは以下の権限を持ちます：
1. **CloudWatch Logs**: Lambda実行ログの出力
2. **S3アクセス**: 画像の読み取りとサムネイル保存
3. **DynamoDB操作**: メタデータの読み書き

---

## 📝 Step 3-1: IAMカスタムポリシー作成

Lambda関数がS3とDynamoDBにアクセスするための権限を先に作成します。

### IAMサービスへ移動

1. 検索バーに「IAM」と入力して選択
2. 左メニューから **「ポリシー」** を選択
3. **「ポリシーを作成」** ボタンをクリック

![IAMポリシー作成ボタン](/img/handson/placeholder-create-button.svg)

:::tip 💡 画像について
この画像は現在プレースホルダーです。実際のAWSコンソール画面に後日置き換え予定です。
:::

### Step 3-1-1: S3アクセス用ポリシーの作成

1. **「JSON」** タブを選択
2. 以下のJSONをコピー＆ペースト：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::2025-tohoku-it-あなたのユーザー名-images/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::2025-tohoku-it-あなたのユーザー名-images"
        }
    ]
}
```

:::caution ⚠️ 重要
`2025-tohoku-it-あなたのユーザー名-images` を実際のバケット名に置き換えてください。
例: `2025-tohoku-it-giovanni-images`
:::

#### 📋 S3ポリシーの詳細解説

```json
{
    "Version": "2012-10-17",  // ポリシー言語のバージョン（固定値）
    "Statement": [             // 権限ルールの配列
        {
            "Effect": "Allow",     // この権限を「許可」
            "Action": [            // 実行可能な操作
                "s3:GetObject",    // ファイル読み取り（元画像ダウンロード）
                "s3:PutObject",    // ファイル書き込み（サムネイルアップロード）
                "s3:DeleteObject"  // ファイル削除（不要になった場合）
            ],
            "Resource": "arn:aws:s3:::あなたのバケット名/*"  // バケット内のオブジェクト
        },
        {
            "Effect": "Allow", 
            "Action": ["s3:ListBucket"],  // バケット一覧表示
            "Resource": "arn:aws:s3:::あなたのバケット名"   // バケット自体
        }
    ]
}
```

**Resource指定の違い:**
- `バケット名/*`: オブジェクト（ファイル）に対する操作
- `バケット名`: バケット自体に対する操作

3. **「次へ」** をクリック
4. ポリシー名: `2025-tohoku-it-あなたのユーザー名-S3-Access`
5. **「ポリシーの作成」** をクリック

### Step 3-1-2: DynamoDBアクセス用ポリシーの作成

1. 再度 **「ポリシーを作成」** をクリック
2. **「JSON」** タブを選択
3. 以下のJSONをコピー＆ペースト：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan"
            ],
            "Resource": "arn:aws:dynamodb:ap-northeast-1:*:table/2025-tohoku-it-あなたのユーザー名-image-metadata"
        }
    ]
}
```

#### 📋 DynamoDBポリシーの詳細解説

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",    // 新規アイテム追加（メタデータ保存）
                "dynamodb:GetItem",    // 単一アイテム取得（ID指定検索）
                "dynamodb:UpdateItem", // 既存アイテム更新（追加処理時）
                "dynamodb:DeleteItem", // アイテム削除（クリーンアップ時）
                "dynamodb:Query",      // インデックスを使用した検索
                "dynamodb:Scan"        // 全テーブルスキャン（管理用）
            ],
            "Resource": "arn:aws:dynamodb:リージョン:アカウント:table/テーブル名"
        }
    ]
}
```

**操作の使い分け:**
- `PutItem/UpdateItem`: 画像処理後のメタデータ保存
- `Query`: upload_time-indexを使った時系列検索
- `GetItem`: 特定画像のメタデータ取得
- `Scan`: 管理画面での一覧表示（コスト注意）

4. **「次へ」** をクリック
5. ポリシー名: `2025-tohoku-it-あなたのユーザー名-DynamoDB-Access`
6. **「ポリシーの作成」** をクリック

---

## 🔐 Step 3-2: IAMロール作成

作成したカスタムポリシーをロールにアタッチします。

### IAMロール作成の開始

1. 左メニューから **「ロール」** を選択
2. **「ロールを作成」** ボタンをクリック

### 基本設定

**信頼されたエンティティの選択：**
```yaml
信頼されたエンティティタイプ: AWSのサービス
サービスまたはユースケース: Lambda と入力して、選択
```

**「次へ」** をクリック

### ポリシーのアタッチ

検索ボックスで以下を順番に検索し、チェックを入れる：

1. **基本実行ポリシー**
   ```
   AWSLambdaBasicExecutionRole
   ```
   
   :::tip 💡 このポリシーの役割
   CloudWatch Logsへのログ書き込み権限を提供します。Lambda関数の実行ログを確認するために必要です。
   :::

2. **S3アクセスポリシー**（Step 3-1-1で作成）
   ```
   2025-tohoku-it-あなたのユーザー名-S3-Access
   ```

3. **DynamoDBアクセスポリシー**（Step 3-1-2で作成）
   ```
   2025-tohoku-it-あなたのユーザー名-DynamoDB-Access
   ```

   :::tip 💡 腹痛のポリシーを一度に指定する
   検索でフィルタし、選択後は検索ボックスのテキストを削除すると、また探すことができます
   あなたのユーザー名で検索すると簡単に出てくるはずです
   :::


合計**3つのポリシー**が選択されていることを確認してから **「次へ」** をクリック

### ロール名の設定

```yaml
ロール名: 2025-tohoku-it-あなたのユーザー名-lambda-role
例: 2025-tohoku-it-giovanni-lambda-role

説明: Lambda role for image processing handson
```

**「ロールを作成」** をクリック

---

## ✅ 完了確認チェックリスト

以下のすべてが完了していることを確認：

### Step 3-1: カスタムポリシー作成
- [ ] S3アクセス用ポリシー: `[あなたの名前]-S3-Access` を作成した
- [ ] DynamoDBアクセス用ポリシー: `[あなたの名前]-DynamoDB-Access` を作成した

### Step 3-2: IAMロール作成とポリシーアタッチ
- [ ] ロール名: `2025-tohoku-it-[あなたの名前]-lambda-role` を作成した
- [ ] 信頼されたエンティティ: Lambda を設定した
- [ ] AWSLambdaBasicExecutionRoleをアタッチした
- [ ] S3アクセス用カスタムポリシーをアタッチした
- [ ] DynamoDBアクセス用カスタムポリシーをアタッチした
- [ ] 合計3つのポリシーがロールに設定されている

---

## 🚨 トラブルシューティング

### Q: ポリシーの作成でエラーが出る
**A:** JSON形式が正しいか確認してください。特に`{}`や`[]`の対応、カンマの位置に注意してください。

### Q: バケット名の部分で迷う
**A:** `あなたのユーザー名-images` は、Step 1で作成したS3バケット名と完全一致させてください。

### Q: ロール名が長すぎると言われる
**A:** ロール名は64文字以内にしてください。ユーザー名が長い場合は短縮してください。

### Q: カスタムポリシーが検索で見つからない
**A:** ポリシー作成後、少し時間をおいてから検索してください。それでも見つからない場合は、ポリシー名のスペルを確認してください。

### Q: ポリシーがロールにアタッチできない
**A:** ポリシー作成後、IAMロール画面を更新してから検索してください。

---

## 🎊 Step 3 完了！

:::success おめでとうございます！
IAMロールの作成が完了しました。これで、Lambda関数が安全にS3とDynamoDBにアクセスできるようになります。
:::

### 📝 このステップで学んだこと
- ✅ IAMロールとポリシーの作成方法
- ✅ 最小権限の原則の実践
- ✅ AWSサービス間の権限設定
- ✅ セキュリティのベストプラクティス

<div style={{textAlign: 'center', marginTop: '2rem', fontSize: '1.2em'}}>

[**← 前へ: Step 2 - DynamoDB作成**](./02-dynamodb) | [**次へ: Step 4 - Lambda関数作成 →**](./04-lambda-function)

</div>

---

## 🔗 次のステップの準備

次のStep 4では、実際にLambda関数を作成し、今回作成したIAMロールを設定します。
画像処理を行うPythonコードも実装します。