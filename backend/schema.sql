-- ==============================================================================
-- Rural Innovation Hub - MySQL 8.0 Relational Database Schema
-- Production-ready, indexed, normalized DDL with UTC timestamps
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS rural_innovation_hub
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE rural_innovation_hub;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. Users Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(50) NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    pin_hash VARCHAR(255) NULL,
    role ENUM('INNOVATOR', 'INVESTOR', 'MENTOR', 'ADMIN') NOT NULL DEFAULT 'INNOVATOR',
    phone VARCHAR(20) NULL,
    village_city VARCHAR(100) NULL,
    district VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    pincode VARCHAR(10) NULL,
    preferred_language VARCHAR(50) DEFAULT 'English',
    bio TEXT NULL,
    skills_expertise VARCHAR(255) NULL,
    organization_college VARCHAR(150) NULL,
    profile_photo_url VARCHAR(500) NULL,
    verified BOOLEAN DEFAULT FALSE,
    consent_given BOOLEAN DEFAULT TRUE,
    consent_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at DATETIME NULL,
    INDEX idx_users_role (role),
    INDEX idx_users_state (state),
    INDEX idx_users_verified (verified),
    INDEX idx_users_is_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Inventions Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    category ENUM('Agriculture', 'Water & Irrigation', 'Renewable Energy', 'Health & Sanitation', 'Small Farm Machinery', 'Education & Crafts', 'Other') NOT NULL,
    region VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    assembly_steps JSON NOT NULL,
    total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'INR',
    image_url VARCHAR(500) NULL,
    video_url VARCHAR(500) NULL,
    blueprint_url VARCHAR(500) NULL,
    sketch_url VARCHAR(500) NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    submission_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    moderation_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT NULL,
    safety_score INT DEFAULT 85,
    durability_notes TEXT NULL,
    field_tested BOOLEAN DEFAULT FALSE,
    scaling_stage ENUM('RAW_PROTOTYPE', 'PEER_VALIDATED', 'FIELD_TESTED', 'MARKET_READY') NOT NULL DEFAULT 'RAW_PROTOTYPE',
    estimated_co2_savings_kg DECIMAL(10, 2) DEFAULT 0.00,
    estimated_water_savings_liters DECIMAL(12, 2) DEFAULT 0.00,
    views_count INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventions_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_inventions_creator (creator_id),
    INDEX idx_inventions_category (category),
    INDEX idx_inventions_region (region),
    INDEX idx_inventions_status (moderation_status),
    INDEX idx_inventions_field_tested (field_tested),
    INDEX idx_inventions_cost (total_cost),
    INDEX idx_inventions_created_at (created_at),
    INDEX idx_inventions_sha256 (sha256_hash),
    INDEX idx_inventions_is_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Invention Materials Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invention_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invention_id INT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    quantity VARCHAR(50) NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    local_source VARCHAR(150) NULL,
    optimized_alternative VARCHAR(150) NULL,
    estimated_savings DECIMAL(10, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_materials_invention FOREIGN KEY (invention_id) REFERENCES inventions(id) ON DELETE CASCADE,
    INDEX idx_materials_invention (invention_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Reviews & Ratings Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invention_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_invention FOREIGN KEY (invention_id) REFERENCES inventions(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_invention_review UNIQUE (invention_id, user_id),
    INDEX idx_reviews_invention (invention_id),
    INDEX idx_reviews_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Messages Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    invention_id INT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_invention FOREIGN KEY (invention_id) REFERENCES inventions(id) ON DELETE SET NULL,
    INDEX idx_messages_conversation (sender_id, receiver_id),
    INDEX idx_messages_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Funding Pledges Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS funding_pledges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invention_id INT NOT NULL,
    donor_id INT NULL,
    donor_name VARCHAR(150) NULL,
    donor_email VARCHAR(255) NULL,
    pledge_type ENUM('MONETARY', 'SPARE_PARTS', 'EQUIPMENT_TIME', 'MENTORSHIP_HOURS') NOT NULL DEFAULT 'MONETARY',
    amount DECIMAL(12, 2) DEFAULT 0.00,
    spare_part_details TEXT NULL,
    status ENUM('PLEDGED', 'ACCEPTED', 'FULFILLED', 'CANCELLED') NOT NULL DEFAULT 'PLEDGED',
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pledges_invention FOREIGN KEY (invention_id) REFERENCES inventions(id) ON DELETE CASCADE,
    CONSTRAINT fk_pledges_donor FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_pledges_invention (invention_id),
    INDEX idx_pledges_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Bounties Table (Rural Grassroots Problem Statements)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bounties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poster_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    region VARCHAR(100) NOT NULL,
    reward_amount DECIMAL(12, 2) DEFAULT 0.00,
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    deadline DATETIME NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bounties_poster FOREIGN KEY (poster_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_bounties_poster (poster_id),
    INDEX idx_bounties_region (region),
    INDEX idx_bounties_status (status),
    INDEX idx_bounties_is_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Bounty Submissions Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bounty_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bounty_id INT NOT NULL,
    invention_id INT NOT NULL,
    innovator_id INT NOT NULL,
    note TEXT NULL,
    status ENUM('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_submissions_bounty FOREIGN KEY (bounty_id) REFERENCES bounties(id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_invention FOREIGN KEY (invention_id) REFERENCES inventions(id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_innovator FOREIGN KEY (innovator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_submissions_bounty (bounty_id),
    INDEX idx_submissions_invention (invention_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. Replications Table (Builds by other community members)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS replications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invention_id INT NOT NULL,
    builder_id INT NOT NULL,
    location VARCHAR(150) NOT NULL,
    state VARCHAR(100) NOT NULL,
    photo_url VARCHAR(500) NULL,
    notes TEXT NULL,
    build_cost DECIMAL(10, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_replications_invention FOREIGN KEY (invention_id) REFERENCES inventions(id) ON DELETE CASCADE,
    CONSTRAINT fk_replications_builder FOREIGN KEY (builder_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_replications_invention (invention_id),
    INDEX idx_replications_state (state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. Mentorship Requests Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mentorship_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invention_id INT NOT NULL,
    innovator_id INT NOT NULL,
    mentor_id INT NOT NULL,
    match_score INT NOT NULL DEFAULT 80,
    notes TEXT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'COMPLETED', 'DECLINED') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mentorship_invention FOREIGN KEY (invention_id) REFERENCES inventions(id) ON DELETE CASCADE,
    CONSTRAINT fk_mentorship_innovator FOREIGN KEY (innovator_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_mentorship_mentor FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_mentorship_mentor (mentor_id),
    INDEX idx_mentorship_innovator (innovator_id),
    INDEX idx_mentorship_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. Telemetry Logs Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS telemetry_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invention_id INT NOT NULL,
    power_watts DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    runtime_hours DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    efficiency_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    ambient_temp_c DECIMAL(5, 2) NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_telemetry_invention FOREIGN KEY (invention_id) REFERENCES inventions(id) ON DELETE CASCADE,
    INDEX idx_telemetry_invention (invention_id),
    INDEX idx_telemetry_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 12. Rural Workshops & Makerspaces Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workshops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type ENUM('FabLab', 'ToolLibrary', 'VillageWorkshop', 'PolytechnicMakerSpace') NOT NULL,
    address VARCHAR(255) NOT NULL,
    city_village VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    contact_phone VARCHAR(20) NULL,
    contact_email VARCHAR(100) NULL,
    available_tools JSON NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_workshops_state (state),
    INDEX idx_workshops_type (type),
    INDEX idx_workshops_coords (latitude, longitude),
    INDEX idx_workshops_is_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 13. Licensing Contracts Table (Grassroots Royalty Drafts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS licensing_contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invention_id INT NOT NULL,
    inventor_id INT NOT NULL,
    licensee_name VARCHAR(150) NOT NULL,
    licensee_entity_type VARCHAR(100) NOT NULL,
    royalty_percentage DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
    territory VARCHAR(150) DEFAULT 'India',
    contract_terms TEXT NOT NULL,
    status ENUM('DRAFT', 'OFFERED', 'EXECUTED', 'TERMINATED') NOT NULL DEFAULT 'DRAFT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_licensing_invention FOREIGN KEY (invention_id) REFERENCES inventions(id) ON DELETE CASCADE,
    CONSTRAINT fk_licensing_inventor FOREIGN KEY (inventor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_licensing_invention (invention_id),
    INDEX idx_licensing_inventor (inventor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 13b. Commercial Offers Table (Buy / Rent / License Proposals)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS commercial_offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invention_id INT NOT NULL,
    inventor_id INT NOT NULL,
    official_id INT NULL,
    official_name VARCHAR(150) NOT NULL,
    organization_name VARCHAR(200) NOT NULL,
    official_email VARCHAR(255) NOT NULL,
    official_phone VARCHAR(30) NULL,
    offer_type ENUM('BUY', 'RENT', 'LICENSE') NOT NULL DEFAULT 'BUY',
    proposed_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    rental_duration_months INT NULL,
    message TEXT NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'NEGOTIATING') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_offers_invention FOREIGN KEY (invention_id) REFERENCES inventions(id) ON DELETE CASCADE,
    CONSTRAINT fk_offers_inventor FOREIGN KEY (inventor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_offers_official FOREIGN KEY (official_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_offers_invention (invention_id),
    INDEX idx_offers_inventor (inventor_id),
    INDEX idx_offers_official (official_id),
    INDEX idx_offers_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 14. Notifications Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    link VARCHAR(255) NULL,
    read_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read_at (read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 15. Audit Logs Table (Admin Moderation & Security Trail)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    prior_state JSON NULL,
    new_state JSON NULL,
    reason TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 16. Feature Flags Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feature_flags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    description VARCHAR(255) NULL,
    updated_by_id INT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_flags_user FOREIGN KEY (updated_by_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_feature_flags_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 17. Event Outbox Table (Transactional event persistence & retries)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_outbox (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    payload JSON NOT NULL,
    status ENUM('PENDING', 'PROCESSED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    retry_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME NULL,
    last_error TEXT NULL,
    INDEX idx_outbox_status (status),
    INDEX idx_outbox_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 18. Pitches Table (Direct Investor/NGO Pitching)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pitches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventor_id INT NOT NULL,
    investor_id INT NOT NULL,
    invention_id INT NOT NULL,
    pitch_title VARCHAR(255) NOT NULL,
    pitch_notes TEXT NOT NULL,
    funding_needed DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status ENUM('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'DECLINED') NOT NULL DEFAULT 'SUBMITTED',
    feedback_notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pitches_inventor FOREIGN KEY (inventor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pitches_investor FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pitches_invention FOREIGN KEY (invention_id) REFERENCES inventions(id) ON DELETE CASCADE,
    INDEX idx_pitches_inventor (inventor_id),
    INDEX idx_pitches_investor (investor_id),
    INDEX idx_pitches_invention (invention_id),
    INDEX idx_pitches_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
