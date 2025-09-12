---
sidebar_position: 8
title: Step 6 - CloudFront設定
description: 画像を世界中に高速配信するCloudFront CDNを設定する
---

# 🌐 Step 6: CloudFront設定

## ⏱️ このステップの所要時間
**約15分**

## 🎯 このステップのゴール
- 世界中に高速配信するCloudFrontディストリビューションを作成する
- Origin Access Control（OAC）でセキュリティを向上させる
- キャッシュ設定を最適化してパフォーマンスを向上させる

---

## 📚 CloudFrontとは？

**Amazon CloudFront** は、AWSが提供するコンテンツ配信ネットワーク（CDN）サービスです。

:::info 💡 CloudFrontの利点
- **高速配信**: 世界中の300以上のエッジロケーションから配信
- **コスト削減**: S3からの直接転送コストを削減
- **セキュリティ**: Origin Access Controlでバケットを非公開化
- **可用性**: 複数のエッジで自動的に冗長化
:::

今回のシステムでは、生成されたサムネイル画像をCloudFront経由で高速配信します。

```mermaid
graph LR
    A[👤 ユーザー] --> B[🌐 CloudFront Edge]
    B --> |キャッシュあり| C[⚡ 高速レスポンス]
    B --> |初回アクセス| D[🪣 S3 Origin]
    D --> E[📊 DynamoDB]
    
    style A fill:#e3f2fd
    style B fill:#e8f5e9
    style C fill:#fff3e0
```

---

## 🚀 Step 5-1: CloudFrontディストリビューション作成

### CloudFrontサービスへ移動

1. **「サービス」** → **「ネットワークとコンテンツ配信」** → **「CloudFront」** を選択
2. **「ディストリビューションを作成」** ボタンをクリック
3. 名前を「あなたのユーザー名」に


---

## 🎯 Step 5-2: オリジン設定

### オリジンタイプの選択

1. S3 を選択

### オリジン選択

2. **Browse S3** ボタンを押して、自分のS3バケットを選択
   ```
   2025-tohoku-it-giovanni-images
   ```

:::tip 💡 オリジンとは？
コンテンツの配信元となるサーバーのことです。今回はS3バケットがオリジンになります。
:::

### オリジンパス（オプション）

```yaml
オリジンパス: 空欄
```

オリジンパスを設定することで、特定のフォルダのみを配信対象にできますが、今回はバケット全体とします。

4. **Allow private S3 bucket access to CloudFront - Recommended** にチェック
5. オリジン設定
    - Use recommended origin settings
    - Use recommended cache settings tailored to serving S3 content


### Web Application Firewall (WAF)

1. セキュリティ保護を有効にしないでください
2. 作成まで進んでください

---

## 🔐 Step 5-3: Origin Access Control（OAC）設定

### OACの作成



---

## 🗺️ Step 5-4: 配信確認

### 価格クラス

```yaml
価格クラス: Use all edge locations (best performance)
```

:::info 💰 価格クラスについて
- **Use all edge locations**: 全世界で最高性能（最高価格）
- **Use North America and Europe**: 主要地域のみ（中価格）
- **Use only North America**: 北米のみ（最低価格）

ハンズオンでは性能重視で設定しますが、実際の運用では予算に応じて選択してください。
:::


---

## 📝 Step 5-6: ディストリビューション作成

1. 設定内容を確認
2. **「ディストリビューションを作成」** ボタンをクリック

:::caution ⏳ デプロイ時間について
CloudFrontディストリビューションの作成には **5-10分** かかります。
ステータスが「Deploying」から「Enabled」に変わるまでお待ちください。
:::

```mermaid
graph LR
    A[ディストリビューション作成] --> B[Deploying]
    B --> |5-10分| C[Enabled]
    C --> D[✅ 配信開始]
    
    style A fill:#e3f2fd
    style D fill:#e8f5e9
```

---

## 🔒 Step 5-7: S3バケットポリシー更新

ディストリビューション作成時に、以下の設定がAWS側で実施されていますが、
うまくいってない場合、S3バケットへのアクセス権限を設定する必要があります。

### CloudFrontからのポリシー取得

1. 作成したCloudFrontディストリビューションをクリック
2. **「オリジン」** タブを選択
3. 作成したオリジンを選択して **「編集」** をクリック
4. ページ下部の **「バケットポリシーをコピー」** をクリック

### S3バケットポリシーの更新

1. **「サービス」** → **「S3」** を選択
2. **`あなたのユーザー名-images`** バケットをクリック
3. **「アクセス許可」** タブを選択
4. **「バケットポリシー」** → **「編集」** をクリック
5. コピーしたポリシーを貼り付け
6. **「変更の保存」** をクリック

:::info 📋 バケットポリシーの例
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::あなたのユーザー名-images/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/E1234567890123"
                }
            }
        }
    ]
}
```
このポリシーにより、指定されたCloudFrontディストリビューションからのみS3バケットにアクセスできるようになります。
:::

---

## ✅ 完了確認チェックリスト

以下のすべてが完了していることを確認：

### ディストリビューション作成
- [ ] CloudFrontディストリビューションを作成した
- [ ] 正しいS3バケットをオリジンに設定した
- [ ] OAC（Origin Access Control）を作成・設定した
- [ ] HTTPSリダイレクトを設定した

### セキュリティ設定
- [ ] S3バケットポリシーを更新した
- [ ] CloudFrontからのみアクセス可能になった
- [ ] ディストリビューションのステータスが「Enabled」になった

### 設定確認
- [ ] ドメイン名（例：d123abc456def.cloudfront.net）をメモした
- [ ] 価格クラスとキャッシュポリシーを確認した

---

## 🚨 トラブルシューティング

### Q: ディストリビューションの作成が進まない
**A:** CloudFrontのデプロイは時間がかかります。15分以上経っても変わらない場合は、ページを更新してステータスを確認してください。

### Q: S3バケットポリシーでエラーが出る
**A:** 以下を確認してください：
- コピーしたポリシーが正確か
- バケット名とディストリビューションIDが正しいか
- JSONの形式が正しいか（括弧や引用符の確認）

### Q: 「Access Denied」エラーが出る
**A:** OAC設定とバケットポリシーを確認してください：
- OACが正しく作成・設定されているか
- バケットポリシーが正しく設定されているか

---

## 🎊 Step 5 完了！

:::success おめでとうございます！
CloudFrontの設定が完了しました。これで世界中どこからでも高速に画像を配信できるようになりました！
:::

### 📝 このステップで学んだこと
- ✅ CloudFront CDNの仕組みと利点
- ✅ Origin Access Control（OAC）によるセキュリティ向上
- ✅ キャッシュポリシーの設定方法
- ✅ S3との連携によるコスト最適化

<div style={{textAlign: 'center', marginTop: '2rem', fontSize: '1.2em'}}>

[**← 前へ: Step 5 - S3イベント設定**](./s3-event) | [**次へ: Step 7 - システムテスト →**](./test)

</div>

---

## 📚 参考：CloudFrontの料金について

:::info 💰 CloudFrontの料金体系
- **データ転送料**: 配信量に応じて課金（最初の1TBは約$0.085/GB）
- **HTTPリクエスト料**: リクエスト数に応じて課金（$0.0075/10,000リクエスト）
- **オリジンリクエスト料**: S3へのリクエスト数（$0.0075/10,000リクエスト）

キャッシュにより、オリジンリクエストは大幅に削減されます。
:::

## 🔗 次のステップの準備

次のStep 6では、いよいよシステム全体の動作確認を行います：

1. 📸 画像をS3にアップロード
2. ⚡ Lambda関数が自動実行されることを確認
3. 🖼️ 3つのサイズのサムネイルが生成されることを確認
4. 📊 DynamoDBにメタデータが保存されることを確認
5. 🌐 CloudFront経由で画像にアクセスできることを確認

すべてが連携して動作する感動的な瞬間が待っています！