-- SUPABASE SCHEMA FOR NOURISH CONNECT
-- This script will wipe existing matching tables and create a fresh structure.

DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE; -- In case you named it users

-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- Will match Firebase/Auth UID
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('donor', 'ngo')),
    organization_name TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    phone TEXT,
    addresses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create DONATIONS table
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    image_hint TEXT,
    quantity TEXT,
    type TEXT,
    pickup_deadline TIMESTAMPTZ,
    location TEXT,
    donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'picked-up', 'expired')),
    claimed_by_ngo_id UUID REFERENCES profiles(id),
    distance FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create ORDERS table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES profiles(id),
    receiver_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'completed', 'cancelled')),
    service_type TEXT CHECK (service_type IN ('pickup', 'drop', 'delivery')),
    address JSONB,
    billing JSONB,
    payment_method TEXT,
    delivery_person_id UUID REFERENCES profiles(id),
    estimated_arrival TIMESTAMPTZ,
    current_location JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create PAYMENTS table (Already implemented in Phase 9, but here for completeness)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    amount FLOAT NOT NULL,
    payment_method TEXT,
    payment_status TEXT,
    razorpay_payment_id TEXT,
    razorpay_order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 6. Basic RLS Policies (Public read for donations, private for others)
CREATE POLICY "Public can view donations" ON donations FOR SELECT USING (status = 'available');
CREATE POLICY "Users can insert donations" ON donations FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Users can update their donations" ON donations FOR UPDATE USING (auth.uid() = donor_id);

CREATE POLICY "Public can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage their own profiles" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = donor_id OR auth.uid() = receiver_id);

-- 7. Create SESSIONS table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY, -- Session ID
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    device TEXT,
    browser TEXT,
    os TEXT,
    location TEXT,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    icon TEXT
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sessions" ON sessions FOR ALL USING (auth.uid() = user_id);

