-- =========================================
-- AUTO MARKETPLACE - FINAL DATABASE SCHEMA
-- =========================================

-- =========================================
-- DROP TABLES (FOR RESET - OPTIONAL)
-- =========================================
DROP TABLE IF EXISTS vehicle_main_images CASCADE;
DROP TABLE IF EXISTS vehicle_inventory CASCADE;
DROP TABLE IF EXISTS valuation_history CASCADE;
DROP TABLE IF EXISTS vehicle_valuations CASCADE;
DROP TABLE IF EXISTS inspection_images CASCADE;
DROP TABLE IF EXISTS vehicle_inspections CASCADE;
DROP TABLE IF EXISTS vehicle_images CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- =========================================
-- 1. ROLES
-- =========================================
CREATE TABLE roles (
id SERIAL PRIMARY KEY,
role_name VARCHAR(50) UNIQUE NOT NULL
);

-- =========================================
-- 2. USERS
-- =========================================
CREATE TABLE users (
id SERIAL PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(100) UNIQUE,
password TEXT,
role_id INT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

```
FOREIGN KEY (role_id) REFERENCES roles(id)
```

);

-- =========================================
-- 3. BRANCHES
-- =========================================
CREATE TABLE branches (
id SERIAL PRIMARY KEY,
branch_name VARCHAR(100) NOT NULL,
city VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 4. CUSTOMERS
-- =========================================
CREATE TABLE customers (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
primary_mobile VARCHAR(15) NOT NULL,
secondary_mobile VARCHAR(15),
email VARCHAR(100),
branch_id INT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

```
CONSTRAINT fk_customer_branch
FOREIGN KEY (branch_id)
REFERENCES branches(id)
ON DELETE RESTRICT
```

);

-- =========================================
-- 5. VEHICLES
-- =========================================
CREATE TABLE vehicles (
id SERIAL PRIMARY KEY,

```
customer_id INT NOT NULL,
created_by INT NOT NULL,

vehicle_type VARCHAR(100) NOT NULL,
vehicle_name VARCHAR(100),
purchase_type VARCHAR(50),

model_year INT,
registration_number VARCHAR(20) UNIQUE,

speedometer_reading INT,

outlook_condition VARCHAR(50),
engine_condition VARCHAR(50),
overall_condition VARCHAR(50),

noc_status VARCHAR(20),
challans_pending BOOLEAN DEFAULT FALSE,

exchange_value NUMERIC(10,2),
final_credit_note_value NUMERIC(10,2),

vehicle_status VARCHAR(50) DEFAULT 'INTAKE_CREATED',

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT fk_vehicle_customer
FOREIGN KEY (customer_id)
REFERENCES customers(id)
ON DELETE CASCADE,

CONSTRAINT fk_vehicle_user
FOREIGN KEY (created_by)
REFERENCES users(id)
ON DELETE RESTRICT
```

);

-- =========================================
-- 6. VEHICLE IMAGES
-- =========================================
CREATE TABLE vehicle_images (
id SERIAL PRIMARY KEY,
vehicle_id INT NOT NULL,
image_path TEXT NOT NULL,
image_order INT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

```
FOREIGN KEY (vehicle_id)
REFERENCES vehicles(id)
ON DELETE CASCADE
```

);

-- =========================================
-- INDEXES (PERFORMANCE)
-- =========================================
CREATE INDEX idx_customer_mobile ON customers(primary_mobile);
CREATE INDEX idx_vehicle_reg ON vehicles(registration_number);
CREATE INDEX idx_vehicle_customer ON vehicles(customer_id);
CREATE INDEX idx_vehicle_images ON vehicle_images(vehicle_id);

-- =========================================
-- 7. VEHICLE INSPECTIONS
-- =========================================
CREATE TABLE vehicle_inspections (
id SERIAL PRIMARY KEY,

```
vehicle_id INT NOT NULL,
inspected_by INT NOT NULL,

engine_health VARCHAR(50),
outlook VARCHAR(50),
structural_condition VARCHAR(50),
mechanical_condition VARCHAR(50),
electrical_condition VARCHAR(50),

overall_grade VARCHAR(20),
remarks TEXT,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (vehicle_id)
REFERENCES vehicles(id)
ON DELETE CASCADE,

FOREIGN KEY (inspected_by)
REFERENCES users(id)
ON DELETE RESTRICT
```

);

-- =========================================
-- 8. INSPECTION IMAGES
-- =========================================
CREATE TABLE inspection_images (
id SERIAL PRIMARY KEY,
inspection_id INT NOT NULL,
image_path TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

```
FOREIGN KEY (inspection_id)
REFERENCES vehicle_inspections(id)
ON DELETE CASCADE
```

);

-- =========================================
-- 9. VEHICLE VALUATIONS
-- =========================================
CREATE TABLE vehicle_valuations (
id SERIAL PRIMARY KEY,

```
vehicle_id INT NOT NULL,
inspection_id INT NOT NULL,
evaluated_by INT NOT NULL,

base_price NUMERIC(10,2),
final_price NUMERIC(10,2) NOT NULL,

price_reason TEXT,

status VARCHAR(20) DEFAULT 'PENDING_APPROVAL',

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (vehicle_id)
REFERENCES vehicles(id)
ON DELETE CASCADE,

FOREIGN KEY (inspection_id)
REFERENCES vehicle_inspections(id)
ON DELETE CASCADE,

FOREIGN KEY (evaluated_by)
REFERENCES users(id)
ON DELETE RESTRICT
```

);

-- =========================================
-- 10. VALUATION HISTORY
-- =========================================
CREATE TABLE valuation_history (
id SERIAL PRIMARY KEY,
valuation_id INT,
old_price NUMERIC,
new_price NUMERIC,
changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 11. VEHICLE INVENTORY
-- =========================================
CREATE TABLE vehicle_inventory (
id SERIAL PRIMARY KEY,

```
vehicle_id INT NOT NULL,
valuation_id INT NOT NULL,

listing_price NUMERIC(10,2) NOT NULL,

status VARCHAR(20) DEFAULT 'AVAILABLE',
is_active BOOLEAN DEFAULT TRUE,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (vehicle_id)
REFERENCES vehicles(id)
ON DELETE CASCADE,

FOREIGN KEY (valuation_id)
REFERENCES vehicle_valuations(id)
ON DELETE CASCADE
```

);

-- =========================================
-- 12. VEHICLE MAIN IMAGES
-- =========================================
CREATE TABLE vehicle_main_images (
id SERIAL PRIMARY KEY,
vehicle_id INT,
image_path TEXT,
is_primary BOOLEAN DEFAULT TRUE
);

-- =========================================
-- FUTURE TABLE
-- =========================================
CREATE TABLE inspection_options (
id SERIAL PRIMARY KEY,
type VARCHAR(50),
value VARCHAR(50)
);

-- =========================================
-- 13.Master options created by Antigravity
-- =========================================
-- Table: public.master_options

-- DROP TABLE IF EXISTS public.master_options;

CREATE TABLE IF NOT EXISTS public.master_options
(
    id integer NOT NULL DEFAULT nextval('master_options_id_seq'::regclass),
    category character varying(50) COLLATE pg_catalog."default" NOT NULL,
    label character varying(100) COLLATE pg_catalog."default" NOT NULL,
    value character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT master_options_pkey PRIMARY KEY (id),
    CONSTRAINT master_options_value_key UNIQUE (value)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.master_options
    OWNER to postgres;

-- =========================================
-- 14. VEHICLE STATUS HISTORY
-- =========================================
CREATE TABLE vehicle_status_history (
    id SERIAL PRIMARY KEY,

    vehicle_id INT NOT NULL,
    status VARCHAR(50),

    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vehicle_id)
    REFERENCES vehicles(id)
    ON DELETE CASCADE,

    FOREIGN KEY (changed_by)
    REFERENCES users(id)
    ON DELETE SET NULL
);
-- =========================================
-- 15. VEHICLE DOCUMENTS
-- =========================================
CREATE TABLE vehicle_documents (
    id SERIAL PRIMARY KEY,

    vehicle_id INT NOT NULL,

    document_type VARCHAR(50), -- RC, Insurance, Invoice
    document_path TEXT,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vehicle_id)
    REFERENCES vehicles(id)
    ON DELETE CASCADE
);

-- =========================================
-- END OF FILE
-- =========================================
-- Table: public.roles

-- DROP TABLE IF EXISTS public.roles;

CREATE TABLE IF NOT EXISTS public.roles
(
    id integer NOT NULL DEFAULT nextval('roles_id_seq'::regclass),
    role_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT roles_pkey PRIMARY KEY (id),
    CONSTRAINT roles_role_name_key UNIQUE (role_name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.roles
    OWNER to postgres;