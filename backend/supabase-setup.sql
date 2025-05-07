-- Create articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  source_name TEXT,
  source_url TEXT,
  url TEXT,
  published_at TIMESTAMPTZ DEFAULT now(),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create perspectives table
CREATE TABLE perspectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  viewpoint TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_perspectives_article_id ON perspectives(article_id);
CREATE INDEX idx_perspectives_viewpoint ON perspectives(viewpoint);

-- Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE perspectives ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to articles"
  ON articles FOR SELECT USING (true);

CREATE POLICY "Allow public read access to perspectives"
  ON perspectives FOR SELECT USING (true);

-- Create policies for anon users to insert/update (for development)
CREATE POLICY "Allow anon users to insert articles"
  ON articles FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon users to update articles"
  ON articles FOR UPDATE USING (true);

CREATE POLICY "Allow anon users to delete articles"
  ON articles FOR DELETE USING (true);

CREATE POLICY "Allow anon users to insert perspectives"
  ON perspectives FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon users to update perspectives"
  ON perspectives FOR UPDATE USING (true);

CREATE POLICY "Allow anon users to delete perspectives"
  ON perspectives FOR DELETE USING (true);
