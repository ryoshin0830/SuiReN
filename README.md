# 速読ゴリラ (Speed Reading Gorilla)

日本語学習者のための速読練習ウェブサイト

## プロジェクト概要

速読ゴリラは、日本語学習者の読解流暢さ（Fluency）向上を目的とした速読練習ウェブサイトです。

### 主な機能

- 🦍 **モダンなデザイン**: ガラスモーフィズム効果とアニメーション付きUI
- 📚 **高度な文章管理**: 検索、フィルタリング、並び替え機能搭載
- 📖 **読解速度測定**: 読書時間とスクロール行動を自動記録
- 📝 **理解度テスト**: 選択式問題による理解度確認
- 📱 **QRコード結果**: 正答率に応じた色分けQRコード生成
- 📊 **統計ダッシュボード**: 文章数とレベル別統計の表示
- 🔧 **管理画面**: コンテンツ管理とシステム監視
- 🗄️ **データベース管理**: PostgreSQL + Prisma による動的コンテンツ管理
- 🔌 **REST API**: コンテンツのCRUD操作が可能なAPIエンドポイント
- 🖼️ **画像サポート**: Base64圧縮による複数画像対応・位置指定機能

### 練習ライブラリ機能

- **検索機能**: タイトルやIDでの高速検索
- **フィルタリング**: レベル別（初級・中級・上級）での絞り込み
- **並び替え**: ID順、タイトル順、レベル順、問題数順での表示
- **表示モード**: グリッドビューとリストビューの切り替え
- **ページネーション**: 大量のコンテンツにも対応
- **研究配慮**: 事前に文章内容を閲覧できない設計

### QRコード色分けシステム

- 🔴 **赤色**: 70%未満の正答率
- 🔵 **青色**: 70-80%の正答率
- 🟢 **緑色**: 80%以上の正答率

## 技術スタック

- **フレームワーク**: Next.js 15 + React 19
- **データベース**: PostgreSQL (Neon) + Prisma ORM
- **スタイリング**: Tailwind CSS（モダンアニメーション・ガラスモーフィズム）
- **QRコード**: qrcode ライブラリ
- **フォント**: Inter（モダンタイポグラフィ）
- **API**: REST API (Next.js App Router)
- **ホスティング**: Vercel
- **認証**: 基本パスワード認証

## リポジトリ情報

- **GitHub**: https://github.com/ryoshin0830/speed-reading-gorilla
- **Vercelプロジェクト**: speed-reading-gorilla

## セットアップ

### ローカル開発環境

```bash
# リポジトリのクローン
git clone https://github.com/ryoshin0830/speed-reading-gorilla.git
cd speed-reading-gorilla

# 依存関係のインストール
npm install

# 環境変数設定（.env.localファイルを作成）
# DATABASE_URL=your_neon_database_url_here

# Prismaセットアップ
npx prisma generate
npx prisma db push

# 初期データの投入（オプション）
node scripts/seed.js

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ページ構成

- `/` - ホームページ（モダンなヒーローセクションと詳細説明）
- `/about` - Fluency概念の詳細説明
- `/reading` - 読解練習ライブラリ（検索・フィルタリング機能搭載）
- `/admin` - 管理画面（パスワード: gorira）

## API エンドポイント

### コンテンツ管理 API

#### 全コンテンツ取得
```bash
GET /api/contents
```
**レスポンス例:**
```json
[
  {
    "id": "1-1",
    "title": "ももたろう",
    "level": "初級修了レベル",
    "levelCode": "beginner",
    "text": "むかし、むかし、あるところに...",
    "questions": [
      {
        "id": 1,
        "question": "おじいさんは何をしに山に行きましたか。",
        "options": ["しばかりに", "桃を取りに", "洗濯に", "買い物に"],
        "correctAnswer": 0
      }
    ]
  }
]
```

#### 特定コンテンツ取得
```bash
GET /api/contents/[id]
```

#### 新規コンテンツ作成
```bash
POST /api/contents
Content-Type: application/json

{
  "title": "新しい文章",
  "level": "中級レベル",
  "levelCode": "intermediate",
  "text": "文章の内容...\n\n{{IMAGE:img_001}}\n\n続きの文章...",
  "images": [
    {
      "id": "img_001",
      "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAA...",
      "alt": "説明画像",
      "caption": "画像のキャプション",
      "width": 800,
      "height": 600,
      "compressionRatio": "78.5"
    }
  ],
  "questions": [
    {
      "question": "問題文",
      "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "correctAnswer": 1
    }
  ]
}
```

#### コンテンツ更新
```bash
PUT /api/contents/[id]
Content-Type: application/json

{
  "title": "更新された文章",
  "level": "上級レベル",
  "levelCode": "advanced",
  "text": "更新された内容...\n\n{{IMAGE:img_001}}\n\n文章続き...\n\n{{IMAGE:img_002}}\n\n最後の文章",
  "images": [
    {
      "id": "img_001",
      "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAA...",
      "alt": "更新された画像1",
      "caption": "新しい画像",
      "width": 800,
      "height": 600
    },
    {
      "id": "img_002", 
      "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAA...",
      "alt": "追加画像2",
      "caption": "2番目の画像",
      "width": 800,
      "height": 600
    }
  ],
  "questions": [...]
}
```

#### コンテンツ削除
```bash
DELETE /api/contents/[id]
```

### API テスト例

```bash
# 全コンテンツ取得
curl http://localhost:3000/api/contents

# 新規作成
curl -X POST http://localhost:3000/api/contents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "テスト文章",
    "level": "初級修了レベル",
    "levelCode": "beginner",
    "text": "これはテスト用の文章です。\n\n{{IMAGE:test_img_001}}\n\n画像付きの文章例です。",
    "images": [
      {
        "id": "test_img_001",
        "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAA...",
        "alt": "美しい夕日の風景",
        "caption": "テスト用画像",
        "width": 800,
        "height": 600,
        "compressionRatio": "82.3"
      }
    ],
    "questions": [
      {
        "question": "この文章の目的は？",
        "options": ["練習", "テスト", "学習", "研究"],
        "correctAnswer": 1
      }
    ]
  }'

# 特定コンテンツ取得
curl http://localhost:3000/api/contents/1-1

# 削除
curl -X DELETE http://localhost:3000/api/contents/[id]
```

## 🖼️ 画像機能（Base64複数画像システム）

### 対応する画像形式
- **アップロード対応**: JPEG、PNG、WebP、GIF（最大10MB）
- **自動圧縮**: 最大800×600px、品質80%で最適化
- **Base64保存**: データベース内蔵でExternal依存なし
- **複数画像**: 一つの文章に複数の画像を任意の位置に配置可能

### 画像配置システム
- **プレースホルダー記法**: `{{IMAGE:画像ID}}` で文章内任意位置に配置
- **管理画面統合**: ドラッグ&ドロップでアップロード、ワンクリックで文章挿入
- **リアルタイムプレビュー**: 編集中にリアルタイムで最終表示確認
- **画像管理**: 個別編集・削除・メタデータ管理

### 圧縮・最適化機能
- **自動圧縮**: アップロード時に自動的にサイズ・品質最適化
- **圧縮率表示**: 元ファイルとの比較でデータ削減効果を可視化
- **バンドルサイズ管理**: 総画像データサイズをリアルタイム監視
- **パフォーマンス配慮**: 読み込み遅延やエラーハンドリング完備

### 管理画面での操作
- **画像アップロード**: ファイル選択で自動圧縮・プレビュー
- **メタデータ編集**: 代替テキスト・キャプション設定
- **配置操作**: 「テキストに挿入」ボタンでカーソル位置に自動挿入
- **統計表示**: 文字数・行数・画像数・配置済み画像数のリアルタイム表示

### データベース設計
```prisma
model Content {
  images Json? // 画像配列データ（Base64、メタデータ含む）
}
```

画像データ構造例:
```json
{
  "images": [
    {
      "id": "img_1a2b3c4d5e",
      "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAA...",
      "alt": "桜の花が咲いている公園",
      "caption": "春の美しい桜並木",
      "width": 800,
      "height": 600,
      "originalSize": 2048576,
      "compressedSize": 345678,
      "compressionRatio": "83.1"
    }
  ]
}
```

## 収録コンテンツ

### 初級修了レベル (1-1)
- ももたろう

### 中級レベル (2-1)
- 仏教

### 上級レベル (3-1)
- エチオピアのコーヒー

## プロジェクトメンバー

- **光恵さん（Mitsue Tabata-Sandom）**: マッセイ大学、プロジェクト主導者
- **梁震さん（リョウ・シン）**: 京都大学、ITエンジニア・開発担当
- **松下達彦さん（たつさん）**: 国立国語研究所、アドバイザー

## 研究背景

このプロジェクトは国際交流基金助成金（4,000ドル）により実施され、多読プログラムで併用できる速読サイトの構築を通じて、日本語学習者の読解流暢さ向上を目指しています。

## ライセンス

このプロジェクトは研究・教育目的で開発されています。

## デプロイ

### 🌐 本番環境
**プロジェクトは既にVercelにデプロイ済みです！**

- **プロジェクト名**: speed-reading-gorilla
- **デプロイ方法**: GitHubリポジトリから手動デプロイ
- **URL**: https://speed-reading-gorilla.vercel.app （予想URL - 実際のURLを確認してください）

### 新規デプロイ
他の環境にデプロイする場合は、以下のボタンを使用してください：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ryoshin0830/speed-reading-gorilla)

## デザイン特徴

### モダンUI/UX
- **ガラスモーフィズム**: 透明感のあるカードデザイン
- **グラデーション**: 美しい色彩遷移
- **マイクロインタラクション**: ホバーエフェクトとアニメーション
- **レスポンシブ**: モバイル・タブレット・デスクトップ対応

### 速読ゴリラキャラクター
- アニメーション付きSVGロゴ
- 親しみやすいゴリラキャラクター
- 読書をテーマにしたデザイン

## 大規模コンテンツ対応

システムは数百の文章に対応できるよう設計されています：
- 効率的な検索・フィルタリング
- ページネーション（9件ずつ表示）
- パフォーマンス最適化
- 直感的なナビゲーション

## 今後の機能追加予定

- [x] ~~新しいコンテンツの追加機能~~ ✅ 完了
- [x] ~~既存コンテンツの編集機能~~ ✅ 完了  
- [x] ~~データベース統合~~ ✅ 完了
- [x] ~~REST API 機能~~ ✅ 完了
- [x] ~~画像サポート機能~~ ✅ 完了
- [ ] タグ機能とカテゴリ分類
- [ ] 学習データの分析機能
- [ ] 多言語対応（英語・中国語）
- [ ] 実際のWordファイルからのコンテンツ自動読み込み
- [ ] ダークモード対応
- [ ] ユーザー認証システム
- [ ] 学習進捗の保存機能
