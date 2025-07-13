# 安全なデプロイメント手順

## 🚨 重要な変更

以前の設定では `prisma db push` がビルドプロセスに含まれており、本番データの消失リスクがありました。
この問題は修正されました。

## 新しいデプロイメントフロー

1. **開発時**
   ```bash
   # スキーマ変更後、マイグレーションファイルを作成
   npm run migrate:dev
   ```

2. **PR作成時**
   - マイグレーションファイルも含めてコミット
   - レビュアーはマイグレーションファイルを確認

3. **マージ時**
   - GitHub Actionsが自動的にマイグレーションを実行
   - その後、Vercelが自動デプロイ

## マイグレーションコマンド

```bash
# 開発環境でマイグレーション作成
npm run migrate:dev

# マイグレーションの状態確認
npm run migrate:status

# 本番環境へのマイグレーション（通常はGitHub Actionsが実行）
npm run migrate:deploy
```

## 手動でのマイグレーション実行

もしGitHub Actionsが失敗した場合：

```bash
# 1. 本番データベースURLを設定
export DATABASE_URL="本番のデータベースURL"

# 2. マイグレーションを実行
npm run migrate:deploy
```

## 禁止事項

❌ **絶対にやってはいけないこと**
- `prisma db push` を本番環境で実行
- `--force-reset` フラグの使用
- `--accept-data-loss` フラグの使用
- マイグレーションファイルの手動編集

## トラブルシューティング

### マイグレーションが失敗した場合

1. エラーメッセージを確認
2. `npm run migrate:status` で状態確認
3. 必要に応じてロールバック用のマイグレーションを作成

### データの不整合が発生した場合

1. バックアップから復元（Neon DBのバックアップ機能を使用）
2. 手動でSQLを実行して修正

## セキュリティ

- 本番データベースのURLは環境変数で管理
- GitHub Secretsに保存
- ローカルには`.env.production`を作成（Gitにはコミットしない）