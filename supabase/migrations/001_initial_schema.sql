-- Enable PostGIS for geospatial functions
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Focos de fuego reportados
CREATE TABLE fire_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  source TEXT NOT NULL,
  source_id TEXT,
  description TEXT,
  reported_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  confidence_score INTEGER DEFAULT 0,
  intensity TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('pending', 'verified', 'active', 'contained', 'extinguished', 'false_alarm')),
  CONSTRAINT valid_source CHECK (source IN ('manual', 'nasa_firms', 'twitter', 'whatsapp', 'telegram')),
  CONSTRAINT valid_intensity CHECK (intensity IS NULL OR intensity IN ('low', 'medium', 'high', 'extreme'))
);

-- Recursos disponibles (camiones cisterna, voluntarios)
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status TEXT NOT NULL DEFAULT 'available',
  capacity INTEGER,
  contact_phone TEXT,
  assigned_to UUID REFERENCES fire_reports(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_type CHECK (type IN ('water_truck', 'volunteer', 'equipment')),
  CONSTRAINT valid_status CHECK (status IN ('available', 'deployed', 'offline'))
);

-- Verificaciones/upvotes de reportes
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fire_report_id UUID REFERENCES fire_reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  vote INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_vote CHECK (vote IN (-1, 1)),
  UNIQUE(fire_report_id, user_id)
);

-- Perfiles de usuario extendidos
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'public',
  display_name TEXT,
  phone TEXT,
  zone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_role CHECK (role IN ('public', 'verifier', 'admin'))
);

-- Índices geoespaciales
CREATE INDEX idx_fire_reports_location ON fire_reports USING gist (
  ll_to_earth(latitude, longitude)
);
CREATE INDEX idx_resources_location ON resources USING gist (
  ll_to_earth(latitude, longitude)
);

-- Índices adicionales
CREATE INDEX idx_fire_reports_status ON fire_reports(status);
CREATE INDEX idx_fire_reports_created_at ON fire_reports(created_at DESC);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_type ON resources(type);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER fire_reports_updated_at
  BEFORE UPDATE ON fire_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Función para calcular confidence_score basado en verificaciones
CREATE OR REPLACE FUNCTION update_confidence_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE fire_reports
  SET confidence_score = COALESCE(
    (SELECT SUM(vote) FROM verifications WHERE fire_report_id = NEW.fire_report_id),
    0
  )
  WHERE id = NEW.fire_report_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER verifications_update_score
  AFTER INSERT OR UPDATE OR DELETE ON verifications
  FOR EACH ROW EXECUTE FUNCTION update_confidence_score();

-- Row Level Security
ALTER TABLE fire_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: fire_reports
CREATE POLICY "Fire reports visible to all" ON fire_reports
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can create reports" ON fire_reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR reported_by IS NULL);

CREATE POLICY "Admins can update reports" ON fire_reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'verifier'))
  );

-- Policies: resources
CREATE POLICY "Resources visible to all" ON resources
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage resources" ON resources
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policies: verifications
CREATE POLICY "Verifications visible to all" ON verifications
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can verify" ON verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verification" ON verifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies: profiles
CREATE POLICY "Profiles visible to all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'public');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
