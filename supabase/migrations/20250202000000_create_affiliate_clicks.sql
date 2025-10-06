-- アフィリエイトクリックトラッキングテーブル
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- クリック情報
  platform TEXT NOT NULL,
  anime_id TEXT NOT NULL,

  -- ユーザー情報
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,

  -- タイムスタンプ
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- インデックス用
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_platform ON affiliate_clicks(platform);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_anime_id ON affiliate_clicks(anime_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user_id ON affiliate_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON affiliate_clicks(created_at DESC);

-- RLS (Row Level Security) 設定
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- 管理者のみが全データを閲覧可能
CREATE POLICY "管理者は全データを閲覧可能" ON affiliate_clicks
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- ユーザーは自分のクリックのみ閲覧可能
CREATE POLICY "ユーザーは自分のクリックを閲覧可能" ON affiliate_clicks
  FOR SELECT
  USING (auth.uid() = user_id);

-- 全員がクリックを記録可能（匿名含む）
CREATE POLICY "全員がクリックを記録可能" ON affiliate_clicks
  FOR INSERT
  WITH CHECK (true);

-- コメント追加
COMMENT ON TABLE affiliate_clicks IS 'アフィリエイトリンクのクリックを追跡';
COMMENT ON COLUMN affiliate_clicks.platform IS '配信プラットフォーム (crunchyroll, netflix等)';
COMMENT ON COLUMN affiliate_clicks.anime_id IS 'アニメID';
COMMENT ON COLUMN affiliate_clicks.user_id IS 'クリックしたユーザーID (NULL = 匿名)';
COMMENT ON COLUMN affiliate_clicks.ip_address IS 'クリック元IPアドレス';
COMMENT ON COLUMN affiliate_clicks.user_agent IS 'ユーザーエージェント';
COMMENT ON COLUMN affiliate_clicks.clicked_at IS 'クリック日時';
