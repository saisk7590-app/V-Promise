-- Run these once in your PostgreSQL database to speed up inventory search
-- Safe to run multiple times (uses IF NOT EXISTS)

CREATE INDEX IF NOT EXISTS idx_vehicle_name ON vehicles(vehicle_name);
CREATE INDEX IF NOT EXISTS idx_vehicle_reg ON vehicles(registration_number);
CREATE INDEX IF NOT EXISTS idx_vehicle_year ON vehicles(model_year);
CREATE INDEX IF NOT EXISTS idx_inventory_price ON vehicle_inventory(listing_price);
