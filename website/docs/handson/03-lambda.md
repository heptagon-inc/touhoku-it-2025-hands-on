---
sidebar_position: 5
title: Step 3 - Lambda関数作成
description: 画像を自動処理するLambda関数を作成する
---

# ⚡ Step 3: Lambda関数作成

## ⏱️ このステップの所要時間
**約15分**

## 🎯 このステップのゴール
- 画像処理を行うLambda関数を作成する
- IAMロールで適切な権限を設定する
- 環境変数とタイムアウトを設定する

---

## 📚 AWS Lambdaとは？

**AWS Lambda** は、サーバーを管理せずにコードを実行できるサーバーレスコンピューティングサービスです。

:::info 💡 Lambdaの特徴
- **サーバーレス**: インフラ管理不要
- **自動スケーリング**: リクエストに応じて自動拡張
- **料金効率**: 実行時間分だけ課金（ミリ秒単位）
- **イベント駆動**: S3、DynamoDB等のイベントで自動実行
:::

今回のLambda関数は以下の処理を行います：
1. **S3イベントトリガー**: 画像がアップロードされたら自動起動
2. **画像処理**: 3つのサイズ（150px, 300px, 600px）にリサイズ
3. **S3保存**: 生成したサムネイルを効率的にアップロード
4. **メタデータ記録**: 処理結果をDynamoDBに構造化して保存

### 🏗️ アーキテクチャ選択の技術的理由

#### Python 3.9 採用の理由
- **安定性**: 本番環境での実績が豊富
- **ライブラリサポート**: PIL/Pillowの安定動作
- **デバッグ容易**: エラー情報が充実

#### x86_64 アーキテクチャ採用の理由
- **互換性**: 全てのPythonライブラリで確実に動作
- **デバッグ**: トラブルシューティング情報が豊富
- **安定性**: 長期間の運用実績

:::tip 💡 最新技術の選択肢
- **Python 3.12**: 20%高速だが、一部ライブラリで互換性課題
- **arm64 (Graviton2)**: 20%コスト安・34%高性能だが、ライブラリ互換性の検証が必要
- 本ハンズオンでは**安定性を重視**してPython 3.9 + x86_64を採用
:::

---

## 🔐 Step 3-1: IAMロール作成

Lambda関数がS3とDynamoDBにアクセスするための権限を設定します。

### IAMサービスへ移動

1. **「サービス」** → **「セキュリティ、アイデンティティ、コンプライアンス」** → **「IAM」** を選択
2. 左メニューから **「ロール」** を選択
3. **「ロールを作成」** ボタンをクリック

![IAMロール作成ボタン](/img/handson/placeholder-create-button.svg)

:::tip 💡 画像について
この画像は現在プレースホルダーです。実際のAWSコンソール画面に後日置き換え予定です。
:::

### 基本設定

**信頼されたエンティティの選択：**
```yaml
信頼されたエンティティタイプ: AWSのサービス
使用事例: Lambda
```

**「次へ」** をクリック

### 基本ポリシーの追加

検索ボックスで以下を検索し、チェックを入れる：
```
AWSLambdaBasicExecutionRole
```

:::tip 💡 このポリシーの役割
CloudWatch Logsへのログ書き込み権限を提供します。Lambda関数の実行ログを確認するために必要です。
:::

---

## 📝 Step 3-2: カスタムポリシー作成

### S3アクセス用ポリシー

1. **「ポリシーを作成」** をクリック（新しいタブが開く）
2. **「JSON」** タブを選択
3. 以下のJSONをコピー＆ペースト：

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
            "Resource": "arn:aws:s3:::あなたのユーザー名-images/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::あなたのユーザー名-images"
        }
    ]
}
```

:::caution ⚠️ 重要
`あなたのユーザー名-images` を実際のバケット名に置き換えてください。
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

4. **「次へ」** をクリック
5. ポリシー名: `あなたのユーザー名-S3-Access`
6. **「ポリシーの作成」** をクリック

### DynamoDBアクセス用ポリシー

同様の手順で、DynamoDB用のポリシーも作成：

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
            "Resource": "arn:aws:dynamodb:ap-northeast-1:*:table/あなたのユーザー名-image-metadata"
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

ポリシー名: `あなたのユーザー名-DynamoDB-Access`

---

## 🎭 Step 3-3: ロール作成完了

1. 元のタブ（ロール作成画面）に戻る
2. ページを **更新** する
3. 作成した2つのカスタムポリシーを検索して選択：
   - `あなたのユーザー名-S3-Access`
   - `あなたのユーザー名-DynamoDB-Access`
4. 合計**3つのポリシー**が選択されていることを確認

**「次へ」** をクリック

### ロール名の設定

```yaml
ロール名: あなたのユーザー名-lambda-role
例: 2025-tohoku-it-giovanni-lambda-role

説明: Lambda role for image processing handson
```

**「ロールを作成」** をクリック

---

## ⚡ Step 3-4: Lambda関数の作成

### Lambdaサービスへ移動

1. **「サービス」** → **「コンピューティング」** → **「Lambda」** を選択
2. **「関数の作成」** ボタンをクリック

### 基本設定

```yaml
作成方法: 一から作成
関数名: あなたのユーザー名-image-processor
例: 2025-tohoku-it-giovanni-image-processor

ランタイム: Python 3.9
アーキテクチャ: x86_64
```

:::info 📝 ランタイムについて
Python 3.9を使用します。安定性が高く、画像処理ライブラリ（Pillow）との互換性も良好です。
:::

### 実行ロールの設定

```yaml
実行ロール: 既存のロールを使用する
既存のロール: あなたのユーザー名-lambda-role
```

**「関数の作成」** をクリック

```mermaid
graph LR
    A[IAMロール作成] --> B[ポリシー追加]
    B --> C[Lambda関数作成]
    C --> D[ロール割り当て]
    D --> E[✅ 権限設定完了]
    
    style E fill:#e8f5e9
```

---

## 📦 Step 3-5: 関数コードのアップロード

### コードのアップロード

1. Lambda関数の詳細画面で **「コード」** タブを確認
2. **「アップロード元」** → **「.zipファイル」** を選択
3. 講師から配布された **`lambda-image-processor.zip`** をアップロード
4. **「保存」** をクリック

:::tip 💡 zipファイルの内容
- `lambda_function.py`: メイン処理
- `PIL/`: 画像処理ライブラリ（Pillow）
- サムネイル生成とDynamoDB連携のコード
:::

---

## ⚙️ Step 3-6: 環境変数の設定

1. **「設定」** タブをクリック
2. **「環境変数」** を選択
3. **「編集」** ボタンをクリック
4. **「環境変数を追加」** をクリック

```yaml
キー: TABLE_NAME
値: あなたのユーザー名-image-metadata
例: 2025-tohoku-it-giovanni-image-metadata
```

**「保存」** をクリック

---

## ⏱️ Step 3-7: タイムアウトとメモリ設定

1. **「設定」** → **「一般設定」** を選択
2. **「編集」** ボタンをクリック

```yaml
メモリ: 512 MB
タイムアウト: 5分 0秒
説明: Image processing function for handson
```

:::warning ⚠️ タイムアウトの重要性
大きな画像の処理には時間がかかる場合があります。デフォルトの3秒では不足するため、5分に設定します。
:::

**「保存」** をクリック

---

## ✅ 完了確認チェックリスト

以下のすべてが完了していることを確認：

### IAMロール
- [ ] ロール名: `2025-tohoku-it-[あなたの名前]-lambda-role` を作成した
- [ ] S3アクセス用ポリシーを作成・追加した
- [ ] DynamoDBアクセス用ポリシーを作成・追加した
- [ ] AWSLambdaBasicExecutionRoleを追加した

### Lambda関数
- [ ] 関数名: `2025-tohoku-it-[あなたの名前]-image-processor` を作成した
- [ ] Python 3.9ランタイムを選択した
- [ ] IAMロールを正しく設定した
- [ ] zipファイルをアップロードした

### 設定
- [ ] 環境変数 `TABLE_NAME` を設定した
- [ ] タイムアウトを5分に設定した
- [ ] メモリを512MBに設定した

---

## 🚨 トラブルシューティング

### Q: ロールが選択できない
**A:** IAMロール作成後、Lambda画面を更新してください。それでも表示されない場合は、ロール名を確認してください。

### Q: zipファイルのアップロードでエラーが出る
**A:** ファイルサイズが大きすぎる可能性があります。配布されたファイルを使用しているか確認してください。

### Q: 環境変数の保存でエラーが出る
**A:** キー名に誤字がないか確認してください。`TABLE_NAME`（すべて大文字）である必要があります。

### Q: タイムアウト設定が保存されない
**A:** 最大値は15分です。5分以下の値を設定してください。

---

## 🎊 Step 3 完了！

:::success おめでとうございます！
Lambda関数の作成が完了しました。次のステップでS3からのトリガーを設定すると、画像が自動処理されるようになります。
:::

### 📝 このステップで学んだこと
- ✅ IAMロールとポリシーの作成方法
- ✅ Lambda関数の作成と設定
- ✅ 環境変数の使用方法
- ✅ タイムアウトとメモリの適切な設定

<div style={{textAlign: 'center', marginTop: '2rem', fontSize: '1.2em'}}>

[**← 前へ: Step 2 - DynamoDB作成**](./dynamodb) | [**次へ: Step 4 - S3イベント設定 →**](./s3-event)

</div>

---

## 📚 参考：Lambda関数のコード概要

作成したLambda関数は以下の処理を行います：

```python
# 疑似コード（実際のコードの概要）
def lambda_handler(event, context):
    # 1. S3イベントから画像情報を取得
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    # 2. 画像をダウンロード
    image = download_from_s3(bucket, key)
    
    # 3. 3つのサイズでサムネイル作成
    thumbnails = {
        'small': resize_image(image, 150),
        'medium': resize_image(image, 300),
        'large': resize_image(image, 600)
    }
    
    # 4. サムネイルをS3にアップロード
    for size, thumb in thumbnails.items():
        upload_to_s3(thumb, f"thumbnails/{size}/{key}")
    
    # 5. メタデータをDynamoDBに保存
    save_to_dynamodb({
        'image_id': generate_uuid(),
        'upload_time': datetime.now(),
        'original_url': f"s3://{bucket}/{key}",
        'thumbnails': thumbnail_urls
    })
```

---

## 🛠️ コードトラブル時の復旧方法

Lambda関数のコードに問題が発生した場合の対処法をまとめています。

### パターン1: Lambda関数エディタでの直接修正

#### 軽微な修正の場合
1. **Lambda関数のページに移動**
   - Lambda関数一覧から作成した関数をクリック
   - **「コード」** タブを選択

2. **エディタで直接編集**
   - `lambda_function.py` ファイルをクリック
   - 修正が必要な部分を編集
   - **「Deploy」** ボタンをクリックして保存

3. **テスト実行**
   - **「Test」** ボタンをクリック
   - テストイベントを作成して動作確認

#### よくある修正例
```python
# 環境変数の参照間違い
table_name = os.environ['TABLE_NAME']  # 正しい

# インデント間違い
def process_image(image_data):
    # 4スペースでインデント
    return processed_image
```

### パターン2: zipファイルの再作成・アップロード

#### 大規模な修正や複数ファイルの場合

**Step 1: 正しいコードファイルの準備**
```bash
# ローカル環境での作業
mkdir lambda-fix
cd lambda-fix

# 修正されたコードをコピー
# lambda_function.py の内容を修正
```

**Step 2: zipファイルの作成**
```bash
# 必要なライブラリと一緒にzip作成
zip -r image-processor-fixed.zip .
```

**Step 3: Lambda関数へのアップロード**
1. Lambda関数の **「コード」** タブ
2. **「アップロード元」** → **「.zipファイル」** を選択
3. 作成したzipファイルを選択してアップロード
4. **「Save」** をクリック

### パターン3: 設定関連の確認・修正

#### 環境変数の確認
```yaml
TABLE_NAME: あなたのユーザー名-image-metadata
例: 2025-tohoku-it-giovanni-image-metadata
```

1. Lambda関数の **「設定」** → **「環境変数」**
2. `TABLE_NAME` の値が正しいDynamoDBテーブル名と一致するか確認
3. 間違っている場合は **「編集」** で修正

#### IAMロールの確認
1. Lambda関数の **「設定」** → **「アクセス権限」**
2. **実行ロール**で使用しているロール名を確認
3. IAMコンソールでロールの権限を確認

#### タイムアウト・メモリ設定の確認
```yaml
推奨設定:
タイムアウト: 5分（300秒）
メモリ: 512 MB
アーキテクチャ: x86_64
```

### 緊急時復旧チェックリスト

コードトラブル発生時は以下を順番に確認：

- [ ] **CloudWatch Logs**でエラー内容を確認
  - Lambda関数名のロググループを参照
  - エラーメッセージから原因を特定

- [ ] **環境変数**の設定値を確認
  - `TABLE_NAME` がDynamoDBテーブル名と一致
  - スペルミス、余分な文字がないか

- [ ] **IAMロール**の権限を確認
  - S3読み取り・書き込み権限
  - DynamoDB操作権限
  - CloudWatch Logs出力権限

- [ ] **関数設定**を確認
  - タイムアウト: 300秒（5分）
  - メモリ: 512MB以上
  - ランタイム: Python 3.9

- [ ] **テストイベント**での動作確認
  - 簡単なS3イベントでテスト
  - エラーログを確認

:::warning 🚨 重要な注意点
- コードを修正する前に、**必ず元のコードをバックアップ**してください
- 修正後は**必ずテスト**を実行してから本番利用してください  
- わからない場合は**スタッフに相談**してください
:::

---

## 🔗 次のステップの準備

次のStep 4では、S3バケットにイベントトリガーを設定します。
これにより、画像がアップロードされた瞬間に自動的にLambda関数が実行されるようになります。