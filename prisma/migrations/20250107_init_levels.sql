-- Levelテーブルの作成
CREATE TABLE IF NOT EXISTS levels (
  id VARCHAR(255) PRIMARY KEY,
  "displayName" VARCHAR(255) NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "isDefault" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初期レベルデータの挿入
INSERT INTO levels (id, "displayName", "orderIndex", "isDefault")
VALUES 
  ('beginner', '中級前半', 1, true),
  ('intermediate', '中級レベル', 2, false),
  ('advanced', '上級レベル', 3, false)
ON CONFLICT (id) DO UPDATE SET
  "displayName" = EXCLUDED."displayName",
  "orderIndex" = EXCLUDED."orderIndex";

-- 既存のコンテンツのlevelCodeを修正
UPDATE contents 
SET "levelCode" = 'beginner'
WHERE "levelCode" IS NULL 
   OR "levelCode" = ''
   OR "levelCode" NOT IN ('beginner', 'intermediate', 'advanced');

-- 外部キー制約を追加（既に存在する場合はスキップ）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'contents_levelCode_fkey'
    ) THEN
        ALTER TABLE contents 
        ADD CONSTRAINT contents_levelCode_fkey 
        FOREIGN KEY ("levelCode") 
        REFERENCES levels(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;