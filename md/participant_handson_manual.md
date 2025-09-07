# 📚 AWS画像処理ハンズオン実習マニュアル
## 2025年東北ITイベント参加者用

---

## 🎯 今日作るシステム

画像をアップロードすると自動的に3つのサイズのサムネイルを作成し、世界中に高速配信するシステム

```
📸 画像アップロード → 🪣 S3保存 → ⚡ Lambda処理 → 🖼️ サムネイル生成
                                        ↓
🌐 CloudFront配信 ← 🪣 S3保存 ← 📊 DynamoDB記録
```

## 📋 あなたの情報

**※以下を配布資料から確認して記入してください**

- **ユーザー名**: `2025-tohoku-it-giovanni` ← あなたの名前
- **Access Key ID**: `AKIA...` ← 配布資料参照
- **Secret Access Key**: `...` ← 配布資料参照
- **リージョン**: `ap-northeast-1` （東京）

---

## 🚀 Step 1: S3バケット作成（10分）

### 1-1. AWSコンソールにログイン

1. ブラウザで https://console.aws.amazon.com/ にアクセス
2. **「IAMユーザー」** を選択
3. 配布された認証情報を入力してログイン

### 1-2. S3バケット作成

1. AWSコンソール上部の **「サービス」** → **「S3」** を選択
2. **「バケットを作成」** をクリック

**設定内容（コピペ用）:**
```
バケット名: あなたのユーザー名-images
例: 2025-tohoku-it-giovanni-images

リージョン: アジアパシフィック（東京）ap-northeast-1

パブリックアクセスをブロック: ✅ すべてチェック
バケットのバージョニング: 無効
デフォルト暗号化: 無効
オブジェクトロック: 無効
```

3. **「バケットを作成」** をクリック

### 1-3. サンプル画像の確認

1. **`2025-tohoku-it-sample-images`** バケットをクリック
2. **`samples`** フォルダ内の画像を確認（後でテストに使用）

**✅ 完了確認:** 自分の名前のバケットがS3一覧に表示される

---

## 📊 Step 2: DynamoDBテーブル作成（10分）

### 2-1. DynamoDBサービスに移動

1. **「サービス」** → **「DynamoDB」** を選択
2. **「テーブルの作成」** をクリック

### 2-2. テーブル設定

**設定内容（コピペ用）:**
```
テーブル名: あなたのユーザー名-image-metadata
例: 2025-tohoku-it-giovanni-image-metadata

パーティションキー: image_id （文字列）

テーブルクラス: DynamoDB Standard
キャパシティモード: オンデマンド
暗号化の保存: DynamoDBが所有
```

3. **「テーブルの作成」** をクリック

### 2-3. グローバルセカンダリインデックス（GSI）追加

テーブル作成後、以下を追加：

1. 作成したテーブルを選択 → **「インデックス」** タブ
2. **「インデックスの作成」** をクリック

**GSI設定（コピペ用）:**
```
インデックス名: upload-time-index
パーティションキー: upload_time （文字列）
投影: すべての属性
```

**✅ 完了確認:** テーブルステータスが「アクティブ」になる（2-3分）

---

## 🔐 Step 3: IAMロール作成（15分）

### 3-1. IAMサービスに移動

1. **「サービス」** → **「IAM」** を選択
2. 左メニュー **「ロール」** → **「ロールを作成」**

### 3-2. 基本設定

**ロール設定（コピペ用）:**
```
信頼されたエンティティタイプ: AWSのサービス
使用事例: Lambda
```

**「次へ」** をクリック

### 3-3. 基本ポリシーの追加

検索ボックスで以下を検索してチェック：
```
AWSLambdaBasicExecutionRole
```

### 3-4. S3アクセス用カスタムポリシー作成

1. **「ポリシーを作成」** をクリック（新しいタブが開く）
2. **「JSON」** タブを選択
3. 以下をコピー＆ペースト：

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

**重要:** `あなたのユーザー名-images` を実際のバケット名に変更

4. **「次へ」** → ポリシー名: `あなたのユーザー名-S3-Access` → **「ポリシーの作成」**

### 3-5. DynamoDBアクセス用カスタムポリシー作成

同様に新しいポリシーを作成：

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

**重要:** `あなたのユーザー名-image-metadata` を実際のテーブル名に変更

ポリシー名: `あなたのユーザー名-DynamoDB-Access`

### 3-6. ロール作成完了

1. 元のタブに戻り、ページを更新
2. 作成した2つのカスタムポリシーを検索・選択
3. 合計3つのポリシーが選択されていることを確認
4. **「次へ」** → ロール名: `あなたのユーザー名-lambda-role` → **「ロールを作成」**

**✅ 完了確認:** IAMロール一覧に作成したロールが表示される

---

## ⚡ Step 4: Lambda関数作成（20分）

### 4-1. Lambdaサービスに移動

1. **「サービス」** → **「Lambda」** を選択
2. **「関数の作成」** をクリック

> **💡 最新設定のメリット:**
> - **Python 3.12**: 最新の安定版、高パフォーマンス
> - **arm64**: 20%安い料金、34%高い価格性能
> - **画像処理**: ARM64はGraviton2プロセッサで計算処理が高速

### 4-2. 関数の基本設定

**関数設定（コピペ用）:**
```
作成方法: 一から作成
関数名: あなたのユーザー名-image-processor
ランタイム: Python 3.9
アーキテクチャ: x86_64

実行ロール: 既存のロールを使用する
既存のロール: あなたのユーザー名-lambda-role
```

**「関数の作成」** をクリック

### 4-3. 関数コードのアップロード

1. **「コード」** タブで **「アップロード元」** → **「.zipファイル」**
2. 講師から配布された **`lambda-image-processor.zip`** をアップロード
3. **「保存」** をクリック

### 4-4. 環境変数の設定

1. **「設定」** タブ → **「環境変数」** → **「編集」**
2. **「環境変数を追加」** をクリック

**環境変数（コピペ用）:**
```
キー: TABLE_NAME
値: あなたのユーザー名-image-metadata
```

**「保存」** をクリック

### 4-5. タイムアウト・メモリ設定

1. **「設定」** → **「一般設定」** → **「編集」**

**設定値（コピペ用）:**
```
タイムアウト: 5分 0秒
メモリ: 512 MB
説明: Image processing function for handson
```

**「保存」** をクリック

**✅ 完了確認:** 関数の設定が正しく保存される

---

## 🔗 Step 5: S3トリガー設定（10分）

### 5-1. Lambda関数にトリガーを追加

1. Lambda関数の **「設定」** → **「トリガー」** タブ
2. **「トリガーを追加」** をクリック

### 5-2. S3トリガー設定

**トリガー設定（コピペ用）:**
```
ソース: S3
バケット: あなたのユーザー名-images
イベントタイプ: すべてのオブジェクト作成イベント
プレフィックス: （空欄）
サフィックス: （空欄）
```

3. **「追加」** をクリック

**✅ 完了確認:** トリガー一覧にS3トリガーが表示される

---

## 🧪 Step 6: 画像処理テスト（10分）

### 6-1. テスト画像のダウンロード

1. **S3** → **`2025-tohoku-it-sample-images`** → **`samples`** フォルダ
2. **`landscape_1.jpg`** をダウンロード（任意の画像でOK）

### 6-2. 自分のバケットに画像をアップロード

1. **S3** → **`あなたのユーザー名-images`** バケット
2. **「アップロード」** → **「ファイルを追加」** → ダウンロードした画像を選択
3. **「アップロード」** をクリック

### 6-3. Lambda実行ログの確認

1. **「サービス」** → **「CloudWatch」** → **「ログ」** → **「ロググループ」**
2. **`/aws/lambda/あなたのユーザー名-image-processor`** をクリック
3. 最新のログストリームをクリック

**期待されるログ（例）:**
```
Processing: 2025-tohoku-it-giovanni-images/landscape_1.jpg
Original image: 1920x1080, Format: JPEG, Size: 234567 bytes
Created thumbnail: thumbnails/small/landscape_1_thumb.jpg
Created thumbnail: thumbnails/medium/landscape_1_thumb.jpg
Created thumbnail: thumbnails/large/landscape_1_thumb.jpg
Metadata saved for: landscape_1.jpg
```

### 6-4. 処理結果の確認

**S3バケットで確認:**
1. **`あなたのユーザー名-images`** バケットを更新（F5キー）
2. **`thumbnails`** フォルダが作成されていることを確認
3. 以下のファイルが生成されていることを確認：

```
thumbnails/
├── small/landscape_1_thumb.jpg     (150x150)
├── medium/landscape_1_thumb.jpg    (300x300)
└── large/landscape_1_thumb.jpg     (600x600)
```

**DynamoDBで確認:**
1. **DynamoDB** → **`あなたのユーザー名-image-metadata`** テーブル
2. **「テーブルの項目を表示」** をクリック
3. アップロードした画像のメタデータが保存されていることを確認

**✅ 完了確認:** 1つの画像から3つのサムネイルが自動生成される

---

## 🌐 Step 7: CloudFront設定（25分）

### 7-1. CloudFrontサービスに移動

1. **「サービス」** → **「CloudFront」** を選択
2. **「ディストリビューションを作成」** をクリック

### 7-2. オリジン設定

**オリジン設定（手順）:**
1. **「オリジンドメイン」** フィールドをクリック
2. プルダウンから **`あなたのユーザー名-images.s3.ap-northeast-1.amazonaws.com`** を選択

**オリジンアクセス設定:**
1. **「Origin access control settings (recommended)」** を選択
2. **「コントロール設定を作成」** をクリック

**OAC設定（コピペ用）:**
```
名前: あなたのユーザー名-oac
説明: OAC for handson image distribution
サインイン: Sign requests (recommended)
```

3. **「作成」** をクリック
4. 作成したOACが選択されていることを確認

### 7-3. デフォルトキャッシュビヘイビア設定

**キャッシュ設定（コピペ用）:**
```
ビューワープロトコルポリシー: Redirect HTTP to HTTPS
許可されたHTTPメソッド: GET, HEAD
キャッシュキーとオリジンリクエスト: Legacy cache settings

TTL設定:
- Minimum TTL: 0
- Maximum TTL: 31536000
- Default TTL: 86400
```

### 7-4. その他の設定

**配信設定（コピペ用）:**
```
価格クラス: Use all edge locations (best performance)
代替ドメイン名: （空欄）
SSL証明書: Default CloudFront Certificate
ログ記録: オフ
コメント: Handson image distribution for あなたのユーザー名
```

### 7-5. ディストリビューション作成

1. **「ディストリビューションを作成」** をクリック
2. 作成完了まで **5-10分** 待機（ステータスが「Enabled」になるまで）

### 7-6. S3バケットポリシー更新

**重要:** CloudFrontからのみアクセスを許可するため

1. CloudFrontディストリビューション詳細画面で推奨バケットポリシーをコピー
2. **S3** → **`あなたのユーザー名-images`** → **「アクセス許可」** → **「バケットポリシー」** → **「編集」**
3. コピーしたポリシーを貼り付け

**バケットポリシー例（参考）:**
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
                    "AWS:SourceArn": "arn:aws:cloudfront::アカウントID:distribution/ディストリビューションID"
                }
            }
        }
    ]
}
```

4. **「変更の保存」** をクリック

**✅ 完了確認:** CloudFrontのステータスが「Enabled」になる

---

## 🎉 Step 8: 最終動作確認（10分）

### 8-1. CloudFront配信テスト

1. CloudFrontディストリビューション画面で **「ドメイン名」** をコピー
   - 例: `d123abc456def.cloudfront.net`

2. ブラウザで以下のURLにアクセス：
```
https://あなたのCloudFrontドメイン/thumbnails/medium/landscape_1_thumb.jpg
```

**✅ 確認ポイント:** 画像が正常に表示される

### 8-2. 複数画像での動作確認

1. 他のサンプル画像（portrait_1.jpg、square_1.jpg等）も自分のバケットにアップロード
2. それぞれについてサムネイルが自動生成されることを確認
3. CloudFrontでアクセスできることを確認

### 8-3. 無限ループ対策の確認

1. **`thumbnails`** フォルダ内の画像を別の場所にコピー
2. それらの画像に対してLambdaが実行されない（無限ループにならない）ことをログで確認

**期待されるログ:**
```
Skipping processed image: thumbnails/small/test_thumb.jpg
```

### 8-4. DynamoDBデータの最終確認

1. **DynamoDB** → **`あなたのユーザー名-image-metadata`** テーブル
2. アップロードしたすべての画像のメタデータが保存されていることを確認

**データ例:**
```json
{
  "image_id": "landscape_1.jpg",
  "upload_time": "2025-01-XX...",
  "original_image": {
    "width": 1920,
    "height": 1080,
    "file_size": 234567,
    "format": "JPEG"
  },
  "processed_images": [
    {
      "key": "thumbnails/small/landscape_1_thumb.jpg",
      "size": "small",
      "width": 150,
      "height": 84
    }
  ]
}
```

**🎉 おめでとうございます！システムが完成しました！**

## 🛠️ コード復旧の使い方

**途中でわからなくなった場合の対処法:**

### 方法1: Lambda関数コードエディタで直接修正
1. Lambda関数の **「コード」** タブを開く
2. `lambda_function.py` の内容を全て削除
3. 上記の完全版コードをコピー＆ペースト
4. **「Deploy」** をクリック

### 方法2: 新しいzipファイルを作成してアップロード
1. ローカルPCで新しいフォルダを作成
2. `lambda_function.py` ファイルを作成
3. 上記の完全版コードを保存
4. フォルダごとzipに圧縮
5. Lambda関数で **「アップロード元」** → **「.zipファイル」** でアップロード

### ⚠️ 注意点
- **環境変数**: `TABLE_NAME` が正しく設定されているか確認
- **IAMロール**: 必要な権限（S3・DynamoDB）が付与されているか確認
- **アーキテクチャ**: arm64を選択しているか確認

**困ったときは講師・スタッフまでお声がけください！** 🙋‍♀️🙋‍♂️

### Lambda関数でエラーが発生する場合

**1. タイムアウトエラー**
```
症状: CloudWatch Logsで "Task timed out after XX seconds"
対処: Lambda関数の設定でタイムアウトを5分に変更
```

**2. 権限エラー**
```
症状: "AccessDenied" または "UnauthorizedOperation"
対処: 
- IAMロールに必要な権限が付与されているか確認
- S3バケット名、DynamoDBテーブル名のスペルミス確認
- 環境変数TABLE_NAMEが正しく設定されているか確認
```

**3. モジュールインポートエラー**
```
症状: "No module named 'PIL'"
対処: 
- Lambdaデプロイパッケージが正しくアップロードされているか確認
- zipファイルが破損していないか確認
```

### CloudFrontで403エラーが出る場合

**1. バケットポリシー問題**
```
症状: CloudFrontドメインで403 Forbidden
対処:
- S3バケットポリシーが正しく設定されているか確認
- CloudFrontのDistribution IDがポリシーに含まれているか確認
```

**2. OAC設定問題**
```
症状: CloudFrontで画像にアクセスできない
対処:
- Origin Access Control (OAC) が正しく作成・設定されているか確認
- 古いOAI設定が残っていないか確認
```

### DynamoDBアクセスエラー

**1. テーブル名エラー**
```
症状: "ResourceNotFoundException"
対処:
- 環境変数TABLE_NAMEが正しく設定されているか確認
- DynamoDBテーブルがアクティブ状態か確認
```

### よくある質問

**Q: 画像処理に時間がかかりすぎます**
A: 大きな画像の場合、処理に時間がかかります。Lambdaのメモリを512MB→1024MBに増やしてください。

**Q: 特定の形式の画像が処理されません**
A: Lambda関数は.jpg, .jpeg, .png, .gif, .bmp, .webpに対応しています。その他の形式は対象外です。

**Q: CloudFrontのデプロイに時間がかかります**
A: 正常です。世界中のエッジロケーションに配信設定を展開するため、5-10分かかります。

---

## 📎 Appendix: WebP変換機能追加（上級者向け・15分）

早く完了した方向けの追加機能です。既存のJPEG/PNGに加えて、**ファイルサイズが30-50%小さくなる**WebP形式も自動生成します。

### A-1. 現在のコードをバックアップ

1. Lambda関数のコード画面で現在のコードを全選択してコピー
2. メモ帳などに保存（万が一の復旧用）

### A-2. コードの修正（差分で表示）

以下の6箇所を順番に修正してください：

#### 修正箇所1: is_processed_image関数

**14行目付近を探して以下を修正:**

```python
# 修正前
    processed_prefixes = [
        'thumbnails/',
        'resized/',
        'processed/'
    ]

# 修正後
    processed_prefixes = [
        'thumbnails/',
        'resized/',
        'processed/',
        'webp/'  # 🆕 WebP変換済みもスキップ
    ]
```

#### 修正箇所2: process_image関数 - サムネイル作成部分

**78行目付近の既存のfor文を探して、関数呼び出しを修正:**

```python
# 修正前
        for thumb_config in thumbnail_sizes:
            processed_image = create_thumbnail(
                image, 
                object_key, 
                thumb_config,
                original_format
            )

# 修正後
        for thumb_config in thumbnail_sizes:
            processed_image = create_thumbnail(
                image, 
                object_key, 
                thumb_config,
                original_format,
                convert_to_webp=False  # 🆕 既存形式
            )
```

**既存のfor文の後（95行目付近）に以下を追加:**

```python
        # 🆕 WebP形式でのサムネイル作成
        for thumb_config in thumbnail_sizes:
            webp_image = create_thumbnail(
                image, 
                object_key, 
                thumb_config,
                original_format,
                convert_to_webp=True  # WebP変換
            )
            
            # S3にアップロード
            upload_result = upload_to_s3(
                bucket_name, 
                webp_image['key'], 
                webp_image['content']
            )
            
            if upload_result:
                processed_images.append(webp_image)
                logger.info(f"Created WebP thumbnail: {webp_image['key']}")
        
        # 🆕 元画像のWebP変換（フルサイズ）
        full_webp_image = create_webp_version(image, object_key)
        upload_result = upload_to_s3(
            bucket_name,
            full_webp_image['key'],
            full_webp_image['content']
        )
        
        if upload_result:
            processed_images.append(full_webp_image)
            logger.info(f"Created full-size WebP: {full_webp_image['key']}")
```

#### 修正箇所3: create_thumbnail関数の修正

**関数定義（130行目付近）を修正:**

```python
# 修正前
def create_thumbnail(image, original_key, config, original_format):

# 修正後
def create_thumbnail(image, original_key, config, original_format, convert_to_webp=False):
```

**ファイル名生成部分（138行目付近）を修正:**

```python
# 修正前
    # ファイル名生成
    name_parts = original_key.rsplit('.', 1)
    base_name = name_parts[0]
    extension = name_parts[1] if len(name_parts) > 1 else 'jpg'
    
    # 処理済み画像のキー（thumbnails/プレフィックス付き）
    thumbnail_key = f"thumbnails/{config['name']}/{base_name}_thumb.{extension}"

# 修正後
    # ファイル名生成
    name_parts = original_key.rsplit('.', 1)
    base_name = name_parts[0]
    
    if convert_to_webp:
        # 🆕 WebP形式の場合
        extension = 'webp'
        thumbnail_key = f"webp/thumbnails/{config['name']}/{base_name}_thumb.webp"
        format_type = 'WebP'
    else:
        # 既存形式の場合
        extension = name_parts[1] if len(name_parts) > 1 else 'jpg'
        thumbnail_key = f"thumbnails/{config['name']}/{base_name}_thumb.{extension}"
        format_type = original_format
```

**保存処理部分（150行目付近）を修正:**

```python
# 修正前
    # フォーマット設定（JPEGの場合は品質設定）
    if original_format in ['JPEG', 'JPG'] or extension.lower() in ['jpg', 'jpeg']:
        thumbnail.save(img_byte_arr, format='JPEG', quality=85, optimize=True)
    else:
        thumbnail.save(img_byte_arr, format=original_format or 'PNG')

# 修正後
    # フォーマット設定
    if convert_to_webp:
        # 🆕 WebP形式で保存（高品質・小サイズ）
        thumbnail.save(img_byte_arr, format='WebP', quality=85, optimize=True)
    elif original_format in ['JPEG', 'JPG'] or extension.lower() in ['jpg', 'jpeg']:
        thumbnail.save(img_byte_arr, format='JPEG', quality=85, optimize=True)
    else:
        thumbnail.save(img_byte_arr, format=format_type or 'PNG')
```

**return部分（160行目付近）を修正:**

```python
# 修正前
    return {
        'key': thumbnail_key,
        'content': img_byte_arr.getvalue(),
        'size': config['name'],
        'width': thumbnail.size[0],
        'height': thumbnail.size[1],
        'file_size': len(img_byte_arr.getvalue())
    }

# 修正後
    return {
        'key': thumbnail_key,
        'content': img_byte_arr.getvalue(),
        'size': config['name'],
        'width': thumbnail.size[0],
        'height': thumbnail.size[1],
        'file_size': len(img_byte_arr.getvalue()),
        'format': 'WebP' if convert_to_webp else format_type  # 🆕 フォーマット情報追加
    }
```

#### 修正箇所4: 新しい関数を追加

**create_thumbnail関数の後（170行目付近）に以下を追加:**

```python
def create_webp_version(image, original_key):
    """
    🆕 元画像と同じサイズのWebP版を作成
    """
    
    # ファイル名生成
    name_parts = original_key.rsplit('.', 1)
    base_name = name_parts[0]
    webp_key = f"webp/original/{base_name}.webp"
    
    # バイト形式に変換
    img_byte_arr = io.BytesIO()
    
    # WebP形式で保存（元サイズ維持）
    image.save(img_byte_arr, format='WebP', quality=90, optimize=True)
    img_byte_arr.seek(0)
    
    return {
        'key': webp_key,
        'content': img_byte_arr.getvalue(),
        'size': 'original',
        'width': image.size[0],
        'height': image.size[1],
        'file_size': len(img_byte_arr.getvalue()),
        'format': 'WebP'
    }
```

#### 修正箇所5: upload_to_s3関数の修正

**Content-Type判定部分（190行目付近）を修正:**

```python
# 修正前
        # Content-Typeを推定
        content_type = 'image/jpeg'
        if object_key.lower().endswith('.png'):
            content_type = 'image/png'
        elif object_key.lower().endswith('.gif'):
            content_type = 'image/gif'
        elif object_key.lower().endswith('.webp'):
            content_type = 'image/webp'

# 修正後
        # Content-Typeを推定
        if object_key.lower().endswith('.webp'):
            content_type = 'image/webp'  # 🆕 WebP用Content-Type
        elif object_key.lower().endswith('.png'):
            content_type = 'image/png'
        elif object_key.lower().endswith('.gif'):
            content_type = 'image/gif'
        else:
            content_type = 'image/jpeg'
```

#### 修正箇所6: save_metadata_to_dynamodb関数の修正

**DynamoDBアイテム作成部分（230行目付近）を修正:**

```python
# 修正前
        # DynamoDBアイテム作成
        item = {
            'image_id': original_key,  # パーティションキー
            'upload_time': datetime.utcnow().isoformat(),
            'original_image': {
                'key': original_key,
                'width': width,
                'height': height,
                'file_size': file_size,
                'format': image_format
            },
            'processed_images': [],
            'processing_status': 'completed',
            'processing_time': datetime.utcnow().isoformat()
        }

# 修正後
        # DynamoDBアイテム作成
        item = {
            'image_id': original_key,  # パーティションキー
            'upload_time': datetime.utcnow().isoformat(),
            'original_image': {
                'key': original_key,
                'width': width,
                'height': height,
                'file_size': file_size,
                'format': image_format
            },
            'processed_images': [],
            'webp_images': [],  # 🆕 WebP画像専用フィールド
            'processing_status': 'completed',
            'processing_time': datetime.utcnow().isoformat()
        }
```

**処理済み画像情報の保存部分（250行目付近）を修正:**

```python
# 修正前
        # 処理済み画像情報を追加
        for processed in processed_images:
            item['processed_images'].append({
                'key': processed['key'],
                'size': processed['size'],
                'width': processed['width'],
                'height': processed['height'],
                'file_size': processed['file_size']
            })

# 修正後
        # 処理済み画像情報を追加
        for processed in processed_images:
            image_info = {
                'key': processed['key'],
                'size': processed['size'],
                'width': processed['width'],
                'height': processed['height'],
                'file_size': processed['file_size'],
                'format': processed.get('format', 'JPEG')  # 🆕 フォーマット情報
            }
            
            # 🆕 WebP画像かどうかで分ける
            if processed.get('format') == 'WebP':
                item['webp_images'].append(image_info)
            else:
                item['processed_images'].append(image_info)
```

### A-3. コードをデプロイ

1. **「Deploy」** ボタンをクリック
2. デプロイ完了まで待機（30秒程度）

### A-4. WebP変換の動作テスト

**新しい画像をアップロード:**
1. まだ処理していない画像（portrait_1.jpg等）をS3バケットにアップロード

**処理結果の確認:**
S3バケットで以下の構造が生成されることを確認：

```
あなたのユーザー名-images/
├── portrait_1.jpg                    # 元画像
├── thumbnails/                       # 既存形式サムネイル
│   ├── small/portrait_1_thumb.jpg
│   ├── medium/portrait_1_thumb.jpg
│   └── large/portrait_1_thumb.jpg
└── webp/                            # 🆕 WebP変換画像
    ├── original/portrait_1.webp     # 🆕 フルサイズWebP
    └── thumbnails/                  # 🆕 WebPサムネイル
        ├── small/portrait_1_thumb.webp
        ├── medium/portrait_1_thumb.webp
        └── large/portrait_1_thumb.webp
```

**ファイルサイズ比較:**
S3コンソールでファイルサイズを確認してください：

| 形式 | ファイル例 | サイズ例 | 削減率 |
|------|------------|----------|--------|
| JPEG | thumbnails/medium/portrait_1_thumb.jpg | 25 KB | - |
| WebP | webp/thumbnails/medium/portrait_1_thumb.webp | 15 KB | **40%削減** |

**CloudFrontでの確認:**
```
# 既存JPEG
https://あなたのCloudFrontドメイン/thumbnails/medium/portrait_1_thumb.jpg

# 新しいWebP  
https://あなたのCloudFrontドメイン/webp/thumbnails/medium/portrait_1_thumb.webp
```

**期待されるログ:**
```
Processing: あなたのユーザー名-images/portrait_1.jpg
Original image: 1080x1920, Format: JPEG
Created thumbnail: thumbnails/small/portrait_1_thumb.jpg
Created thumbnail: thumbnails/medium/portrait_1_thumb.jpg  
Created thumbnail: thumbnails/large/portrait_1_thumb.jpg
Created WebP thumbnail: webp/thumbnails/small/portrait_1_thumb.webp
Created WebP thumbnail: webp/thumbnails/medium/portrait_1_thumb.webp
Created WebP thumbnail: webp/thumbnails/large/portrait_1_thumb.webp
Created full-size WebP: webp/original/portrait_1.webp
Metadata saved for: portrait_1.jpg
```

**✅ WebP機能追加完了！**

---

## 🎉 最終完成！

おめでとうございます！以下のシステムが完成しました：

**基本機能:**
- ✅ 画像自動リサイズ（3サイズ）
- ✅ メタデータ自動保存
- ✅ 高速CDN配信
- ✅ 無限ループ対策

**WebP拡張機能（Appendix）:**
- ✅ WebP形式自動変換
- ✅ ファイルサイズ30-50%削減
- ✅ モダンブラウザ対応

これで**明日から本番で使える**実用的な画像処理システムの完成です！

---

*2025年東北ITイベント AWS画像処理ハンズオン*  
*参加者用実習マニュアル完了 🚀*