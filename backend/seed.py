"""
Rural Innovation Hub - Production Seed Script
Populates demo users, rich grassroots inventions with exact matching local SVG visuals,
blueprints, scaling stages, investors directory, commercial offers, pitches, and workshops.
"""
import sys
import json
from datetime import datetime, timedelta
from decimal import Decimal
from app.db.session import SessionLocal, init_db
from app.core.security import get_password_hash, calculate_sha256
from app.models.user import User
from app.models.invention import Invention
from app.models.material import InventionMaterial
from app.models.review import ReviewRating
from app.models.pledge import FundingPledge
from app.models.bounty import Bounty, BountySubmission
from app.models.replication import Replication
from app.models.mentorship import MentorshipRequest
from app.models.telemetry import TelemetryLog
from app.models.workshop import Workshop
from app.models.feature_flag import FeatureFlag
from app.models.commercial_offer import CommercialOffer
from app.models.pitch import Pitch
from app.models.notification import Notification
from app.models.social import InventionLike, InventionComment


def seed_database():
    print("Initializing database tables...")
    init_db()

    db = SessionLocal()
    try:
        force_reseed = ("--force" in sys.argv or "-f" in sys.argv) if hasattr(sys, "argv") else False
        existing_users = db.query(User).count()
        existing_inventions = db.query(Invention).filter(Invention.is_deleted == False).count()

        if existing_users > 0 and existing_inventions >= 8 and not force_reseed:
            print(f"Database already contains {existing_users} users. Updating records with local matching assets & stages...")
            # Update existing inventions with exact matching local SVG assets and scaling stages
            inv_map = {
                "Low-Cost Solar Drip Micro-Irrigation Kit": {
                    "image": "/images/inventions/solar-drip.svg",
                    "blueprint": "/images/blueprints/solar-drip-blueprint.svg",
                    "stage": "FIELD_TESTED",
                },
                "Bicycle-Powered Multi-Crop Thresher & Grain Cleaner": {
                    "image": "/images/inventions/bicycle-thresher.svg",
                    "blueprint": "/images/blueprints/bicycle-thresher-blueprint.svg",
                    "stage": "FIELD_TESTED",
                },
                "Solar-Vibratory Seed Grader for Pulses & Paddy": {
                    "image": "/images/inventions/seed-grader.svg",
                    "blueprint": "/images/blueprints/seed-grader-blueprint.svg",
                    "stage": "MARKET_READY",
                },
                "Hydraulic Agri-Waste Briquette Press": {
                    "image": "/images/inventions/briquette-press.svg",
                    "blueprint": "/images/blueprints/briquette-press-blueprint.svg",
                    "stage": "FIELD_TESTED",
                },
                "Solar Concentrator Water Distiller & Purifier": {
                    "image": "/images/inventions/solar-distiller.svg",
                    "blueprint": "/images/blueprints/solar-distiller-blueprint.svg",
                    "stage": "PEER_VALIDATED",
                },
                "Low-Cost Hand-Crank Seed Drill & Fertilizer Applicator": {
                    "image": "/images/inventions/seed-drill.svg",
                    "blueprint": "/images/blueprints/seed-drill-blueprint.svg",
                    "stage": "RAW_PROTOTYPE",
                },
                "Pneumatic Biomass Straw Mulcher": {
                    "image": "/images/inventions/straw-mulcher.svg",
                    "blueprint": "/images/blueprints/straw-mulcher-blueprint.svg",
                    "stage": "FIELD_TESTED",
                },
                "Clay Pot Evaporative Cool Chamber (Zero-Electricity Refrigerator)": {
                    "image": "/images/inventions/clay-pot-cooler.svg",
                    "blueprint": "/images/blueprints/clay-pot-cooler-blueprint.svg",
                    "stage": "MARKET_READY",
                },
            }

            for title, data in inv_map.items():
                inv = db.query(Invention).filter(Invention.title == title).first()
                if inv:
                    inv.image_url = data["image"]
                    inv.blueprint_url = data["blueprint"]
                    inv.sketch_url = data["blueprint"]
                    inv.scaling_stage = data["stage"]

            # Update users with usernames, 4-digit PINs (1234), and local portraits
            default_pin_hash = get_password_hash("1234")
            user_credentials = {
                "ramesh@ruralhub.org": ("ramesh", default_pin_hash, "/images/avatars/ramesh.jpg"),
                "ananya@ruralhub.org": ("ananya", default_pin_hash, "/images/avatars/ananya.jpg"),
                "prof.sharma@ruralhub.org": ("prof.sharma", default_pin_hash, "/images/avatars/rajesh.jpg"),
                "admin@ruralhub.org": ("admin", default_pin_hash, "/images/avatars/admin.jpg"),
                "kavita@ruralhub.org": ("kavita", default_pin_hash, "/images/avatars/kavita.jpg"),
                "suresh@ruralhub.org": ("suresh", default_pin_hash, "/images/avatars/suresh.jpg"),
                "vikram@nabard.org": ("vikram", default_pin_hash, "/images/avatars/vikram.jpg"),
                "anita@aavishkaar.org": ("anita", default_pin_hash, "/images/avatars/anita.jpg"),
                "nharivishnu31072008@gmail.com": ("hxrivxnu", default_pin_hash, "/images/avatars/harivishnu.jpg"),
            }
            for email, (uname, pin_h, photo) in user_credentials.items():
                u = db.query(User).filter(User.email == email).first()
                if u:
                    if not u.username:
                        u.username = uname
                    u.pin_hash = pin_h
                    if photo:
                        u.profile_photo_url = photo
                    if email == "nharivishnu31072008@gmail.com":
                        u.password_hash = get_password_hash("Password@123")

            # Ensure additional investors exist
            if not db.query(User).filter(User.email == "vikram@nabard.org").first():
                u_vikram = User(
                    full_name="Vikram Deshmukh",
                    username="vikram",
                    email="vikram@nabard.org",
                    password_hash=get_password_hash("Investor@123"),
                    pin_hash=default_pin_hash,
                    role="INVESTOR",
                    phone="+91 94220 55667",
                    village_city="Pune",
                    district="Pune",
                    state="Maharashtra",
                    pincode="411005",
                    preferred_language="Marathi",
                    bio="Chief General Manager, NABARD Rural Innovation & Farm Incubation Fund. Deploying micro-grants for irrigation & smallholder tools.",
                    skills_expertise="Grant Allocations, Micro-finance, Farmer Collectives (FPOs)",
                    organization_college="NABARD Rural Development Banking Cell",
                    profile_photo_url="/images/avatars/vikram.jpg",
                    verified=True,
                    consent_given=True,
                )
                db.add(u_vikram)

            if not db.query(User).filter(User.email == "anita@aavishkaar.org").first():
                u_anita = User(
                    full_name="Dr. Anita Roy",
                    username="anita",
                    email="anita@aavishkaar.org",
                    password_hash=get_password_hash("Investor@123"),
                    pin_hash=default_pin_hash,
                    role="INVESTOR",
                    phone="+91 98101 22334",
                    village_city="New Delhi",
                    district="New Delhi",
                    state="Delhi",
                    pincode="110001",
                    preferred_language="Hindi",
                    bio="Partner at Aavishkaar Capital & Frontier Tech Scout. Investing in clean energy, circular biomass briquetting, and women-led rural enterprises.",
                    skills_expertise="Frontier Agritech, Circular Economy, Equity Financing",
                    organization_college="Aavishkaar Impact Capital",
                    profile_photo_url="/images/avatars/anita.jpg",
                    verified=True,
                    consent_given=True,
                )
                db.add(u_anita)

            db.commit()

            # Seed sample pitches if none exist
            if db.query(Pitch).count() == 0:
                print("Seeding initial pitches...")
                u_ramesh = db.query(User).filter(User.email == "ramesh@ruralhub.org").first()
                u_kavita = db.query(User).filter(User.email == "kavita@ruralhub.org").first()
                u_suresh = db.query(User).filter(User.email == "suresh@ruralhub.org").first()
                u_ananya = db.query(User).filter(User.email == "ananya@ruralhub.org").first()
                u_vikram = db.query(User).filter(User.email == "vikram@nabard.org").first()
                u_anita = db.query(User).filter(User.email == "anita@aavishkaar.org").first()

                inv_drip = db.query(Invention).filter(Invention.creator_id == u_ramesh.id).first()
                inv_grader = db.query(Invention).filter(Invention.creator_id == u_kavita.id).first()
                inv_press = db.query(Invention).filter(Invention.creator_id == u_suresh.id).first()

                if u_ramesh and u_vikram and inv_drip:
                    db.add(Pitch(
                        inventor_id=u_ramesh.id,
                        investor_id=u_vikram.id,
                        invention_id=inv_drip.id,
                        pitch_title="Scale Solar Drip Kits across 20 Tribal Villages in Dahod",
                        pitch_notes="We have field-tested our solar micro-drip kit across 8 chili and tomato plots with 65% water savings. We seek ₹2,50,000 grant funding to pre-fabricate and install 20 kits with Dahod Women Farmer Collectives.",
                        funding_needed=Decimal("250000.00"),
                        status="UNDER_REVIEW",
                        feedback_notes="Impressive field data. Scheduling virtual technical review with our Gujarat Regional Office.",
                    ))

                if u_kavita and u_ananya and inv_grader:
                    db.add(Pitch(
                        inventor_id=u_kavita.id,
                        investor_id=u_ananya.id,
                        invention_id=inv_grader.id,
                        pitch_title="Self-Help Group Mass Adoption for Pulse Sorting",
                        pitch_notes="Seeking ₹1,80,000 seed investment to manufacture 15 solar vibratory pulse seed graders for Jeevika SHG clusters in Madhubani and Saharsa.",
                        funding_needed=Decimal("180000.00"),
                        status="ACCEPTED",
                        feedback_notes="Approved for full pilot grant under Pragati Rural Seed Fund Phase 2.",
                    ))

                if u_suresh and u_anita and inv_press:
                    db.add(Pitch(
                        inventor_id=u_suresh.id,
                        investor_id=u_anita.id,
                        invention_id=inv_press.id,
                        pitch_title="Commercial Briquette Manufacturing Center in Cauvery Delta",
                        pitch_notes="Requesting ₹4,00,000 debt/grant facility to establish a village-level agro-waste processing unit converting paddy straw into clean smokeless cooking logs.",
                        funding_needed=Decimal("400000.00"),
                        status="SUBMITTED",
                    ))
                db.commit()

            # Seed sample likes, comments & commercial offers for LinkedIn feed feel
            all_users = db.query(User).all()
            all_invs = db.query(Invention).filter(Invention.is_deleted == False).all()

            if all_users and all_invs:
                # 1. Sample Likes
                if db.query(InventionLike).count() < 10:
                    print("Seeding sample likes...")
                    for idx, inv in enumerate(all_invs):
                        likers = [all_users[(idx + k) % len(all_users)] for k in range(1, 5)]
                        for u in likers:
                            if not db.query(InventionLike).filter(InventionLike.invention_id == inv.id, InventionLike.user_id == u.id).first():
                                db.add(InventionLike(invention_id=inv.id, user_id=u.id, created_at=datetime.utcnow() - timedelta(days=idx + 1)))
                    db.commit()

                # 2. Sample Comments
                if db.query(InventionComment).count() < 8:
                    print("Seeding sample comments...")
                    comments_pool = [
                        "Outstanding low-cost fabrication! Have you tested this during the heavy monsoon season?",
                        "NABARD Rural Innovation Wing is actively looking to sponsor field trials of 25 units for this design.",
                        "Replicated this blueprint at our village workshop in Anand! Works like a charm with scrap cycle parts.",
                        "Can this be adapted for smaller farm plots or millet processing? Happy to advise on engineering optimizations.",
                        "Aavishkaar Capital would love to discuss a pilot procurement order for our farmer producer cooperatives in MP.",
                    ]
                    for idx, inv in enumerate(all_invs[:6]):
                        for c_idx in range(2):
                            u = all_users[(idx + c_idx + 1) % len(all_users)]
                            comm_text = comments_pool[(idx + c_idx) % len(comments_pool)]
                            db.add(InventionComment(
                                invention_id=inv.id,
                                user_id=u.id,
                                comment_text=comm_text,
                                created_at=datetime.utcnow() - timedelta(hours=(idx * 5 + c_idx * 2 + 1)),
                            ))
                    db.commit()

                # 3. Sample Commercial Offers & Paid Reuses
                if db.query(CommercialOffer).count() < 6:
                    print("Seeding sample commercial offers (Buy / Rent / Paid Reuse)...")
                    investor = db.query(User).filter(User.role == "INVESTOR").first() or all_users[1]
                    sample_offers = [
                        ("Paid Reuse", Decimal("45000.00"), "PAID", "Gujarat Agri-Tech Federation", "Paid licensing fee to fabricate and deploy 20 units across Anand district."),
                        ("Buy", Decimal("125000.00"), "PAID", "NABARD Rural Enterprise Wing", "Procured 5 field-tested units for demonstration kiosks in Saurashtra."),
                        ("Rent", Decimal("15000.00"), "ACCEPTED", "Kaveri Delta Farmers Collective", "Rented prototype for 3-month paddy harvest demonstration."),
                        ("Paid Reuse", Decimal("35000.00"), "PAID", "Pragati SHG Cluster", "License fee paid for cooperative manufacturing across 4 blocks."),
                        ("Buy", Decimal("80000.00"), "PENDING", "Mahyco Rural Foundation", "Proposed procurement of 3 demonstration sets."),
                    ]
                    for o_idx, (o_type, amt, st, org, msg) in enumerate(sample_offers):
                        target_inv = all_invs[o_idx % len(all_invs)]
                        db.add(CommercialOffer(
                            invention_id=target_inv.id,
                            inventor_id=target_inv.creator_id,
                            official_id=investor.id,
                            buyer_id=investor.id,
                            official_name=investor.full_name,
                            organization_name=org,
                            official_email=investor.email,
                            official_phone=investor.phone or "+91 98250 11223",
                            offer_type=o_type,
                            proposed_amount=amt,
                            amount_inr=amt,
                            message=msg,
                            status=st,
                            created_at=datetime.utcnow() - timedelta(days=o_idx * 2 + 1),
                        ))
                    db.commit()

            print("Database records updated with local matching visuals, stages, likes, and comments successfully!")
            return

        if force_reseed:
            print("Force re-seed requested. Clearing demo records only (preserving non-demo registered users)...")
            db.query(Pitch).delete()
            db.query(CommercialOffer).delete()
            db.query(ReviewRating).delete()
            db.query(InventionMaterial).delete()
            db.query(FundingPledge).delete()
            db.query(Replication).delete()
            db.query(TelemetryLog).delete()
            db.query(BountySubmission).delete()
            db.query(Bounty).delete()
            db.query(Workshop).delete()
            db.query(MentorshipRequest).delete()
            db.query(Invention).delete()
            db.query(Notification).delete()
            # Only delete demo users, NEVER registered community users!
            db.query(User).filter(User.email.endswith("@ruralhub.org")).delete()
            db.commit()

        print("Seeding demo users & investors...")
        default_pin_hash = get_password_hash("1234")
        users = [
            User(
                full_name="Ramesh Patel",
                username="ramesh",
                email="ramesh@ruralhub.org",
                password_hash=get_password_hash("Innovator@123"),
                pin_hash=default_pin_hash,
                role="INNOVATOR",
                phone="+91 98250 12345",
                village_city="Anand",
                district="Anand",
                state="Gujarat",
                pincode="388001",
                preferred_language="Gujarati",
                bio="Smallholder farmer & grassroots mechanic for 18 years. Passionate about solar water management and low-cost harvesters.",
                skills_expertise="Arc Welding, Drip Irrigation, Bicycle Gear Trains",
                organization_college="Anand Farmers Cooperative",
                profile_photo_url="/images/avatars/ramesh.jpg",
                verified=True,
                consent_given=True,
                created_at=datetime.utcnow() - timedelta(days=60),
            ),
            User(
                full_name="Ananya Sengupta",
                username="ananya",
                email="ananya@ruralhub.org",
                password_hash=get_password_hash("Investor@123"),
                pin_hash=default_pin_hash,
                role="INVESTOR",
                phone="+91 98110 54321",
                village_city="Bengaluru",
                district="Bengaluru Urban",
                state="Karnataka",
                pincode="560001",
                preferred_language="English",
                bio="Social impact angel investor and agritech venture scout. Backing sustainable grassroots hardware solutions.",
                skills_expertise="Seed Capital, Impact Assessment, Agritech Scaling",
                organization_college="Pragati Rural Ventures",
                profile_photo_url="/images/avatars/ananya.jpg",
                verified=True,
                consent_given=True,
                created_at=datetime.utcnow() - timedelta(days=50),
            ),
            User(
                full_name="Prof. Rajesh Sharma",
                username="prof.sharma",
                email="prof.sharma@ruralhub.org",
                password_hash=get_password_hash("Mentor@123"),
                pin_hash=default_pin_hash,
                role="MENTOR",
                phone="+91 94260 98765",
                village_city="Gandhinagar",
                district="Gandhinagar",
                state="Gujarat",
                pincode="382355",
                preferred_language="Hindi",
                bio="Professor of Mechanical Engineering at IIT Gandhinagar. 22 years experience in frugal engineering & patent documentation.",
                skills_expertise="Finite Element Analysis, Mechanical Kinematics, Patent Strategy",
                organization_college="IIT Gandhinagar / Rural Tech Center",
                profile_photo_url="/images/avatars/rajesh.jpg",
                verified=True,
                consent_given=True,
                created_at=datetime.utcnow() - timedelta(days=45),
            ),
            User(
                full_name="System Administrator",
                username="admin",
                email="admin@ruralhub.org",
                password_hash=get_password_hash("Admin@123"),
                pin_hash=default_pin_hash,
                role="ADMIN",
                phone="+91 99999 00000",
                village_city="New Delhi",
                district="Central Delhi",
                state="Delhi",
                pincode="110001",
                preferred_language="English",
                bio="Rural Innovation Hub operations lead, responsible for safety governance, moderation compliance, and workshop mapping.",
                skills_expertise="Platform Governance, Open Hardware Standards, Regulatory Compliance",
                organization_college="Rural Innovation Hub Foundation",
                profile_photo_url="/images/avatars/admin.jpg",
                verified=True,
                consent_given=True,
                created_at=datetime.utcnow() - timedelta(days=90),
            ),
            User(
                full_name="Kavita Devi",
                email="kavita@ruralhub.org",
                password_hash=get_password_hash("Innovator@123"),
                role="INNOVATOR",
                phone="+91 94310 77889",
                village_city="Madhubani",
                district="Madhubani",
                state="Bihar",
                pincode="847211",
                preferred_language="Hindi",
                bio="Women Self-Help Group leader. Developed an upcycled solar vibration seed grader for paddy & pulses.",
                skills_expertise="Seed Selection, Solar Wiring, Community Training",
                organization_college="Jeevika SHG Federation",
                profile_photo_url="/images/avatars/kavita.jpg",
                verified=True,
                consent_given=True,
                created_at=datetime.utcnow() - timedelta(days=40),
            ),
            User(
                full_name="Suresh Kumar",
                email="suresh@ruralhub.org",
                password_hash=get_password_hash("Innovator@123"),
                role="INNOVATOR",
                phone="+91 98420 33445",
                village_city="Thanjavur",
                district="Thanjavur",
                state="Tamil Nadu",
                pincode="613001",
                preferred_language="Tamil",
                bio="Paddy cultivator & blacksmith. Built a low-cost biomass briquette press powered by an old motorcycle engine.",
                skills_expertise="Foundry, Blacksmithing, IC Engine Tuning",
                organization_college="Cauvery Delta Farmers Association",
                profile_photo_url="/images/avatars/suresh.jpg",
                verified=True,
                consent_given=True,
                created_at=datetime.utcnow() - timedelta(days=35),
            ),
            User(
                full_name="Vikram Deshmukh",
                email="vikram@nabard.org",
                password_hash=get_password_hash("Investor@123"),
                role="INVESTOR",
                phone="+91 94220 55667",
                village_city="Pune",
                district="Pune",
                state="Maharashtra",
                pincode="411005",
                preferred_language="Marathi",
                bio="Chief General Manager, NABARD Rural Innovation & Farm Incubation Fund. Deploying micro-grants for irrigation & smallholder tools.",
                skills_expertise="Grant Allocations, Micro-finance, Farmer Collectives (FPOs)",
                organization_college="NABARD Rural Development Banking Cell",
                profile_photo_url="/images/avatars/vikram.jpg",
                verified=True,
                consent_given=True,
                created_at=datetime.utcnow() - timedelta(days=48),
            ),
            User(
                full_name="Dr. Anita Roy",
                email="anita@aavishkaar.org",
                password_hash=get_password_hash("Investor@123"),
                role="INVESTOR",
                phone="+91 98101 22334",
                village_city="New Delhi",
                district="New Delhi",
                state="Delhi",
                pincode="110001",
                preferred_language="Hindi",
                bio="Partner at Aavishkaar Capital & Frontier Tech Scout. Investing in clean energy, circular biomass briquetting, and women-led rural enterprises.",
                skills_expertise="Frontier Agritech, Circular Economy, Equity Financing",
                organization_college="Aavishkaar Impact Capital",
                profile_photo_url="/images/avatars/anita.jpg",
                verified=True,
                consent_given=True,
                created_at=datetime.utcnow() - timedelta(days=42),
            ),
        ]
        db.add_all(users)
        db.flush()

        u_ramesh = users[0]
        u_ananya = users[1]
        u_mentor = users[2]
        u_admin = users[3]
        u_kavita = users[4]
        u_suresh = users[5]
        u_vikram = users[6]
        u_anita = users[7]

        print("Seeding grassroots inventions with exact matching local SVG assets...")
        inventions_data = [
            {
                "creator": u_ramesh,
                "title": "Low-Cost Solar Drip Micro-Irrigation Kit",
                "category": "Water & Irrigation",
                "region": "Gujarat",
                "scaling_stage": "FIELD_TESTED",
                "description": "A gravity-fed micro-drip irrigation system utilizing upcycled 200L food drums, calibrated micro-drippers, and a 12V 40W solar-powered DC diaphragm booster pump. Conserves 65% water compared to furrow flood irrigation.",
                "total_cost": Decimal("3200.00"),
                "image_url": "/images/inventions/solar-drip.svg",
                "blueprint_url": "/images/blueprints/solar-drip-blueprint.svg",
                "sketch_url": "/images/blueprints/solar-drip-blueprint.svg",
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                "safety_score": 92,
                "durability_notes": "All plumbing uses UV-stabilized PVC. Low voltage 12V DC eliminates electric shock hazard.",
                "field_tested": True,
                "co2": Decimal("340.00"),
                "water": Decimal("18500.00"),
                "steps": [
                    {"step": 1, "title": "Drum Stand Fabrication", "details": "Weld a 1.2m elevated tripod stand using scrap 1.5-inch GI pipes to provide sufficient gravity pressure.", "audio_text": "First, fabricate an elevated tripod stand at 1.2 meters to ensure natural head pressure."},
                    {"step": 2, "title": "Drum Fitting & Filter", "details": "Drill a 1-inch hole near the base of the plastic drum, install a brass tank connector and 120-mesh disk filter.", "audio_text": "Install the disc filter to prevent sandy silt from clogging the drippers."},
                    {"step": 3, "title": "Lateral Sub-Mains & Emitters", "details": "Run 16mm LDPE pipes along the crop rows, punch holes at 30cm spacing, and press-fit pressure-compensating drippers.", "audio_text": "Lay down the sixteen millimeter lateral pipes and attach drippers at thirty centimeter intervals."},
                    {"step": 4, "title": "Solar Booster Connection", "details": "Connect the 40W photovoltaic panel to the inline 12V DC pump with a float switch in the tank.", "audio_text": "Wire the solar panel to the pump with a float switch to prevent dry running."},
                ],
                "materials": [
                    {"item_name": "Upcycled 200L Plastic Drum", "quantity": "1 Unit", "unit_cost": Decimal("650.00"), "local_source": "Local Scrap Yard", "optimized_alternative": "Discarded chemical barrel washed with soap", "estimated_savings": Decimal("400.00")},
                    {"item_name": "12V 40W DC Diaphragm Pump", "quantity": "1 Unit", "unit_cost": Decimal("1200.00"), "local_source": "Auto Spare Market", "optimized_alternative": "Scooter washer pump", "estimated_savings": Decimal("300.00")},
                    {"item_name": "16mm LDPE Lateral Pipe (100m)", "quantity": "1 Roll", "unit_cost": Decimal("850.00"), "local_source": "Agri Store", "optimized_alternative": "Standard drip roll", "estimated_savings": Decimal("100.00")},
                    {"item_name": "Pressure Compensating Drippers", "quantity": "50 Pcs", "unit_cost": Decimal("250.00"), "local_source": "Agri Supplier", "optimized_alternative": "Precision micro-aperture tubes", "estimated_savings": Decimal("50.00")},
                    {"item_name": "120-Mesh Disk Filter", "quantity": "1 Unit", "unit_cost": Decimal("250.00"), "local_source": "Hardware Shop", "optimized_alternative": "Fine brass mesh strainer", "estimated_savings": Decimal("80.00")},
                ]
            },
            {
                "creator": u_ramesh,
                "title": "Bicycle-Powered Multi-Crop Thresher & Grain Cleaner",
                "category": "Small Farm Machinery",
                "region": "Gujarat",
                "scaling_stage": "FIELD_TESTED",
                "description": "Ergonomic pedal-operated thresher with dual-drum wire loop cylinder and integrated winnowing blower fan. Processes 45 kg of millet or wheat per hour with zero diesel or grid electricity.",
                "total_cost": Decimal("4800.00"),
                "image_url": "/images/inventions/bicycle-thresher.svg",
                "blueprint_url": "/images/blueprints/bicycle-thresher-blueprint.svg",
                "sketch_url": "/images/blueprints/bicycle-thresher-blueprint.svg",
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                "safety_score": 88,
                "durability_notes": "Rotating cylinder is encased in 18-gauge sheet metal with dual side hand-guards.",
                "field_tested": True,
                "co2": Decimal("510.00"),
                "water": Decimal("0.00"),
                "steps": [
                    {"step": 1, "title": "Bicycle Frame Modification", "details": "Mount an old roadster bicycle frame onto a rigid rectangular angle-iron base.", "audio_text": "Weld the bicycle frame onto an angle-iron base for stability during pedaling."},
                    {"step": 2, "title": "Threshing Drum Assembly", "details": "Fabricate a 40cm wooden/sheet cylinder with U-shaped galvanized steel wire loops spaced at 2 inches.", "audio_text": "Form the threshing drum with wire loops that strip the grains without cracking them."},
                    {"step": 3, "title": "Chain Drive & Flywheel", "details": "Connect bicycle chain drive to a 1:5 step-up jackshaft pulley to achieve 400 RPM at 60 pedal cadence.", "audio_text": "Couple the pedal chain to the jackshaft pulley to increase rotational speed."},
                    {"step": 4, "title": "Winnower Fan Installation", "details": "Mount lightweight aluminum fan blades below the drum to blow chaff away as grain drops.", "audio_text": "Attach the winnowing fan directly beneath the separation chute."},
                ],
                "materials": [
                    {"item_name": "Discarded Bicycle Frame & Gears", "quantity": "1 Set", "unit_cost": Decimal("900.00"), "local_source": "Bicycle Repair Shop", "optimized_alternative": "Scrap single-speed bicycle", "estimated_savings": Decimal("800.00")},
                    {"item_name": "Angle Iron 35x35x4mm (6m)", "quantity": "2 Bars", "unit_cost": Decimal("1400.00"), "local_source": "Local Hardware Fabricator", "optimized_alternative": "Scrap window grill frames", "estimated_savings": Decimal("400.00")},
                    {"item_name": "Pillow Block Bearings (20mm)", "quantity": "2 Pcs", "unit_cost": Decimal("600.00"), "local_source": "Industrial Supplier", "optimized_alternative": "Reconditioned lathe bearings", "estimated_savings": Decimal("250.00")},
                    {"item_name": "18-Gauge GI Shroud Sheet", "quantity": "1 Sheet", "unit_cost": Decimal("1100.00"), "local_source": "Roofing Fabricator", "optimized_alternative": "Repurposed oil barrel drum", "estimated_savings": Decimal("500.00")},
                    {"item_name": "GI Loop Wire & Bolts", "quantity": "1 Pack", "unit_cost": Decimal("800.00"), "local_source": "Hardware Store", "optimized_alternative": "Fencing tie wire", "estimated_savings": Decimal("200.00")},
                ]
            },
            {
                "creator": u_kavita,
                "title": "Solar-Vibratory Seed Grader for Pulses & Paddy",
                "category": "Agriculture",
                "region": "Bihar",
                "scaling_stage": "MARKET_READY",
                "description": "Eccentric-motor powered vibratory screen separator powered by a 20W mini solar panel and LiFePO4 battery pack. Cleans seeds, removes broken hulls, and sorts grains into three uniform sizes for 25% higher germination rates.",
                "total_cost": Decimal("2750.00"),
                "image_url": "/images/inventions/seed-grader.svg",
                "blueprint_url": "/images/blueprints/seed-grader-blueprint.svg",
                "sketch_url": "/images/blueprints/seed-grader-blueprint.svg",
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                "safety_score": 94,
                "durability_notes": "Totally enclosed vibratory motor with rubber damper bushings to reduce fatigue stress.",
                "field_tested": True,
                "co2": Decimal("180.00"),
                "water": Decimal("0.00"),
                "steps": [
                    {"step": 1, "title": "Sieve Box Construction", "details": "Build an inclined stepped wooden box with 3 interchangeable stainless steel mesh screens (4mm, 2.5mm, 1.2mm).", "audio_text": "Construct the tiered sieve tray with three interchangeable mesh grades."},
                    {"step": 2, "title": "Suspension Spring Mounts", "details": "Suspend the box on four repurposed motorcycle valve springs to allow harmonic oscillation.", "audio_text": "Hang the sieve box on four stiff springs to create smooth vibration."},
                    {"step": 3, "title": "Eccentric Weight Motor Attachment", "details": "Attach a 12V 25W DC motor with an off-center brass counterweight to the underside of the box.", "audio_text": "Bolt the eccentric weight motor underneath to generate uniform vibrating motion."},
                    {"step": 4, "title": "Solar & Battery Circuit", "details": "Connect 20W solar panel via a 12V 3A charge controller to a 6Ah battery.", "audio_text": "Wire the solar panel through the charge controller to the battery for all-day sorting."},
                ],
                "materials": [
                    {"item_name": "Tiered SS Wire Mesh Screens", "quantity": "3 Pcs", "unit_cost": Decimal("850.00"), "local_source": "Hardware Store", "optimized_alternative": "Mosquito and grain wire mesh", "estimated_savings": Decimal("200.00")},
                    {"item_name": "12V 25W DC Motor with Weight", "quantity": "1 Unit", "unit_cost": Decimal("750.00"), "local_source": "Electronics Scrap", "optimized_alternative": "Washing machine drain pump motor", "estimated_savings": Decimal("300.00")},
                    {"item_name": "Motorcycle Valve Springs", "quantity": "4 Pcs", "unit_cost": Decimal("200.00"), "local_source": "Auto Mechanic", "optimized_alternative": "Reclaimed suspension springs", "estimated_savings": Decimal("150.00")},
                    {"item_name": "Plywood & Hardwood Frame", "quantity": "1 Set", "unit_cost": Decimal("550.00"), "local_source": "Local Carpenter", "optimized_alternative": "Upcycled fruit crate planks", "estimated_savings": Decimal("250.00")},
                    {"item_name": "20W Solar Panel + Regulator", "quantity": "1 Unit", "unit_cost": Decimal("400.00"), "local_source": "Solar Dealer", "optimized_alternative": "Recycled rooftop cut piece", "estimated_savings": Decimal("100.00")},
                ]
            },
            {
                "creator": u_suresh,
                "title": "Hydraulic Agri-Waste Briquette Press",
                "category": "Renewable Energy",
                "region": "Tamil Nadu",
                "scaling_stage": "FIELD_TESTED",
                "description": "Manual 5-ton bottle jack driven briquette press that converts paddy straw, sugarcane bagasse, and coconut coir dust into high-density smokeless cooking fuel logs.",
                "total_cost": Decimal("5200.00"),
                "image_url": "/images/inventions/briquette-press.svg",
                "blueprint_url": "/images/blueprints/briquette-press-blueprint.svg",
                "sketch_url": "/images/blueprints/briquette-press-blueprint.svg",
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                "safety_score": 89,
                "durability_notes": "Reinforced channel iron cage tested to 10 tons compressive load with high tensile bolts.",
                "field_tested": True,
                "co2": Decimal("1200.00"),
                "water": Decimal("0.00"),
                "steps": [
                    {"step": 1, "title": "Load Frame Fabrication", "details": "Weld an inverted U-frame using 75x40mm structural steel channel iron.", "audio_text": "Fabricate the heavy load frame using structural channel iron to resist hydraulic force."},
                    {"step": 2, "title": "Cylinder Mould Preparation", "details": "Machine a 4-inch heavy-wall steel pipe with perforations for moisture escape and a sliding base plug.", "audio_text": "Drill drainage holes in the steel compression pipe so water escapes during pressing."},
                    {"step": 3, "title": "Hydraulic Jack Installation", "details": "Seat a 5-ton commercial hydraulic bottle jack on the upper crossbeam with return springs.", "audio_text": "Position the five-ton bottle jack with dual return springs for quick retraction."},
                    {"step": 4, "title": "Ejection Mechanism", "details": "Add a foot pedal lever to pop out the compacted briquette after releasing hydraulic pressure.", "audio_text": "Use the bottom ejection lever to push the finished briquette log out."},
                ],
                "materials": [
                    {"item_name": "5-Ton Hydraulic Bottle Jack", "quantity": "1 Unit", "unit_cost": Decimal("1800.00"), "local_source": "Auto Tools Shop", "optimized_alternative": "Truck repair jack", "estimated_savings": Decimal("400.00")},
                    {"item_name": "75x40mm ISMC Channel Iron (3m)", "quantity": "1 Length", "unit_cost": Decimal("1700.00"), "local_source": "Steel Merchant", "optimized_alternative": "Old chassis cross-member", "estimated_savings": Decimal("600.00")},
                    {"item_name": "4-inch Seamless Steel Pipe", "quantity": "0.5m", "unit_cost": Decimal("900.00"), "local_source": "Borewell Drilling Scrap", "optimized_alternative": "Borewell casing pipe offcut", "estimated_savings": Decimal("450.00")},
                    {"item_name": "High Tensile Grade 8.8 Bolts", "quantity": "12 Pcs", "unit_cost": Decimal("450.00"), "local_source": "Industrial Hardware", "optimized_alternative": "Standard flange bolts", "estimated_savings": Decimal("50.00")},
                    {"item_name": "Retraction Coil Springs", "quantity": "2 Pcs", "unit_cost": Decimal("350.00"), "local_source": "Spare Parts", "optimized_alternative": "Garage door springs", "estimated_savings": Decimal("150.00")},
                ]
            },
            {
                "creator": u_ramesh,
                "title": "Solar Concentrator Water Distiller & Purifier",
                "category": "Health & Sanitation",
                "region": "Gujarat",
                "scaling_stage": "PEER_VALIDATED",
                "description": "Parabolic solar trough using polished stainless steel sheets to pasteurize and distill brackish fluorotic groundwater into pure drinking water at 12 liters per sunny day.",
                "total_cost": Decimal("3100.00"),
                "image_url": "/images/inventions/solar-distiller.svg",
                "blueprint_url": "/images/blueprints/solar-distiller-blueprint.svg",
                "sketch_url": "/images/blueprints/solar-distiller-blueprint.svg",
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                "safety_score": 91,
                "durability_notes": "Operates at atmospheric pressure with steam condensation trap. Zero pressurized explosion risk.",
                "field_tested": True,
                "co2": Decimal("420.00"),
                "water": Decimal("4380.00"),
                "steps": [
                    {"step": 1, "title": "Parabolic Trough Ribs", "details": "Cut parabolic curve ribs from 12mm exterior waterproof plywood using a paper template.", "audio_text": "Cut the parabolic ribs accurately using the supplied template."},
                    {"step": 2, "title": "Mirror Reflector Skin", "details": "Rivet thin mirror-finish SS 430 sheet or aluminized Mylar to the inner curvature.", "audio_text": "Attach mirror finish stainless steel sheet to focus sunlight along the focal line."},
                    {"step": 3, "title": "Black Absorber Tube", "details": "Mount a 1-inch copper or black-enameled GI pipe along the focal axis.", "audio_text": "Install the blackened boiler pipe along the focal line where sunlight concentrates."},
                    {"step": 4, "title": "Condenser Coil", "details": "Connect boiler outlet to a copper cooling coil submerged in the cold inlet feed drum.", "audio_text": "Route steam through the condenser coil to collect pure distilled water."},
                ],
                "materials": [
                    {"item_name": "Mirror SS 430 Sheet (8x4 ft)", "quantity": "1 Sheet", "unit_cost": Decimal("1400.00"), "local_source": "Kitchen Fabricator", "optimized_alternative": "Aluminized solar reflector film", "estimated_savings": Decimal("500.00")},
                    {"item_name": "1-inch Copper Tube (2m)", "quantity": "1 Tube", "unit_cost": Decimal("950.00"), "local_source": "AC Repair Supplier", "optimized_alternative": "Blackened GI conduit", "estimated_savings": Decimal("400.00")},
                    {"item_name": "Exterior Grade Plywood", "quantity": "0.5 Sheet", "unit_cost": Decimal("450.00"), "local_source": "Timber Depot", "optimized_alternative": "Scrap shipping palette", "estimated_savings": Decimal("200.00")},
                    {"item_name": "Silicone Food-Grade Tubing", "quantity": "3m", "unit_cost": Decimal("300.00"), "local_source": "Medical Store", "optimized_alternative": "Standard clear vinyl tubing", "estimated_savings": Decimal("80.00")},
                ]
            },
            {
                "creator": u_kavita,
                "title": "Low-Cost Hand-Crank Seed Drill & Fertilizer Applicator",
                "category": "Small Farm Machinery",
                "region": "Bihar",
                "scaling_stage": "RAW_PROTOTYPE",
                "description": "Ergonomic push-wheel seeder with fluted roller metering mechanism that delivers precise seed placement at 5cm uniform depth while dispensing DAP fertilizer simultaneously.",
                "total_cost": Decimal("1950.00"),
                "image_url": "/images/inventions/seed-drill.svg",
                "blueprint_url": "/images/blueprints/seed-drill-blueprint.svg",
                "sketch_url": "/images/blueprints/seed-drill-blueprint.svg",
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                "safety_score": 96,
                "durability_notes": "Polyethylene hoppers resist fertilizer corrosion. Sealed ball bearings in main drive wheel.",
                "field_tested": False,
                "co2": Decimal("110.00"),
                "water": Decimal("0.00"),
                "steps": [
                    {"step": 1, "title": "Drive Wheel & Axle", "details": "Repurpose a 16-inch bicycle front wheel with welded angle cleats for field traction.", "audio_text": "Weld small cleats to a bicycle wheel to provide positive traction in loose soil."},
                    {"step": 2, "title": "Twin Hopper Fabrication", "details": "Fabricate seed and fertilizer bins from cut plastic oil cans with adjustable bottom slide gates.", "audio_text": "Construct dual hoppers for seed and fertilizer from cut oil containers."},
                    {"step": 3, "title": "Fluted Metering Roller", "details": "Carve notched grooves on nylon bar stock coupled to the axle with a 1:1 pulley belt.", "audio_text": "Mount the grooved roller to meter seeds consistently as the wheel rolls."},
                    {"step": 4, "title": "Furrow Opener & Press Wheel", "details": "Attach an arrow-head chisel tine in front and a trailing roller to firm soil over seed.", "audio_text": "Attach the furrow opening tine in front and the soil press wheel behind."},
                ],
                "materials": [
                    {"item_name": "16-inch Bicycle Wheel", "quantity": "1 Unit", "unit_cost": Decimal("450.00"), "local_source": "Bicycle Shop", "optimized_alternative": "Kids discarded cycle wheel", "estimated_savings": Decimal("250.00")},
                    {"item_name": "Nylon / Delrin Metering Bar", "quantity": "1 Piece", "unit_cost": Decimal("350.00"), "local_source": "Lathe Job Shop", "optimized_alternative": "Turned neem hardwood roller", "estimated_savings": Decimal("200.00")},
                    {"item_name": "20L Plastic Can Hoppers", "quantity": "2 Pcs", "unit_cost": Decimal("250.00"), "local_source": "Scrap Dealer", "optimized_alternative": "Edible oil jerry cans", "estimated_savings": Decimal("150.00")},
                    {"item_name": "Furrow Chisel Steel Tine", "quantity": "1 Unit", "unit_cost": Decimal("500.00"), "local_source": "Village Blacksmith", "optimized_alternative": "Leaf spring scrap cutout", "estimated_savings": Decimal("200.00")},
                    {"item_name": "Tubular Handle Pipe", "quantity": "2m", "unit_cost": Decimal("400.00"), "local_source": "Plumbing Shop", "optimized_alternative": "Bamboo poles with steel bracket", "estimated_savings": Decimal("250.00")},
                ]
            },
            {
                "creator": u_suresh,
                "title": "Pneumatic Biomass Straw Mulcher",
                "category": "Agriculture",
                "region": "Tamil Nadu",
                "scaling_stage": "FIELD_TESTED",
                "description": "High-speed rotary chopper that shreds paddy straw stubble in-situ into 2-inch compostable mulch, preventing toxic field stubble burning and retaining soil moisture.",
                "total_cost": Decimal("7800.00"),
                "image_url": "/images/inventions/straw-mulcher.svg",
                "blueprint_url": "/images/blueprints/straw-mulcher-blueprint.svg",
                "sketch_url": "/images/blueprints/straw-mulcher-blueprint.svg",
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                "safety_score": 84,
                "durability_notes": "Hardened spring steel blades; fully enclosed 3mm steel shroud prevents flying projectile debris.",
                "field_tested": True,
                "co2": Decimal("1850.00"),
                "water": Decimal("12000.00"),
                "steps": [
                    {"step": 1, "title": "Rotor Shaft & Flail Assembly", "details": "Mount reversible tractor leaf-spring flails onto a balanced 35mm solid cold-rolled steel shaft.", "audio_text": "Mount leaf spring cutting flails onto the balanced rotor shaft."},
                    {"step": 2, "title": "Heavy Duty Shroud Housing", "details": "Roll a 3mm steel plate into a semicircular cowl with internal shear counter-bars.", "audio_text": "Enclose the rotor in heavy gauge steel with internal stationary shear bars."},
                    {"step": 3, "title": "Engine / PTO Coupling", "details": "Connect dual B-section V-belts to a 5 HP agricultural diesel or electric pump engine.", "audio_text": "Connect double V-belts to your farm engine to provide sufficient inertia."},
                    {"step": 4, "title": "Skid Runners & Deflector", "details": "Weld curved pipe skids at the base for smooth gliding over uneven crop ridges.", "audio_text": "Add curved pipe skids so the mulcher slides easily over paddy bunds."},
                ],
                "materials": [
                    {"item_name": "Leaf Spring Scrap for Flails", "quantity": "6 Pcs", "unit_cost": Decimal("1200.00"), "local_source": "Lorry Spring Repair", "optimized_alternative": "Discarded truck leaf springs", "estimated_savings": Decimal("800.00")},
                    {"item_name": "35mm Steel Shaft + Pillow Bearings", "quantity": "1 Set", "unit_cost": Decimal("2200.00"), "local_source": "Bearing Merchant", "optimized_alternative": "Agricultural pump shaft", "estimated_savings": Decimal("500.00")},
                    {"item_name": "3mm Heavy Steel Plate Shroud", "quantity": "1 Unit", "unit_cost": Decimal("2800.00"), "local_source": "Fabrication Works", "optimized_alternative": "Upcycled water boiler tank half", "estimated_savings": Decimal("1100.00")},
                    {"item_name": "B-Section Dual V-Groove Pulleys", "quantity": "2 Pcs", "unit_cost": Decimal("1600.00"), "local_source": "Machinery Shop", "optimized_alternative": "Flour mill cast pulleys", "estimated_savings": Decimal("400.00")},
                ]
            },
            {
                "creator": u_ramesh,
                "title": "Clay Pot Evaporative Cool Chamber (Zero-Electricity Refrigerator)",
                "category": "Renewable Energy",
                "region": "Gujarat",
                "scaling_stage": "MARKET_READY",
                "description": "Double-walled terracotta and porous wet river sand vegetable cooler maintaining temperatures 10-14°C cooler than ambient with 90% humidity. Keeps fresh produce crisp for up to 12 days without electricity.",
                "total_cost": Decimal("1450.00"),
                "image_url": "/images/inventions/clay-pot-cooler.svg",
                "blueprint_url": "/images/blueprints/clay-pot-cooler-blueprint.svg",
                "sketch_url": "/images/blueprints/clay-pot-cooler-blueprint.svg",
                "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
                "safety_score": 98,
                "durability_notes": "Non-mechanical 100% organic terracotta clay. Zero electrical or chemical hazard.",
                "field_tested": True,
                "co2": Decimal("290.00"),
                "water": Decimal("0.00"),
                "steps": [
                    {"step": 1, "title": "Base Sizing & Outer Pot", "details": "Select a large unglazed porous clay pot (60cm diameter) with perforated drainage holes.", "audio_text": "Choose a large porous terracotta pot as the exterior cooling shell."},
                    {"step": 2, "title": "Inner Vessel Placement", "details": "Place a smaller unglazed pot (40cm diameter) centrally inside, leaving a 10cm perimeter gap.", "audio_text": "Center the inner pot leaving a ten centimeter gap all around."},
                    {"step": 3, "title": "Porous Sand Packing", "details": "Fill the perimeter cavity with clean washed coarse river sand. Saturate twice daily with clean water.", "audio_text": "Fill the cavity with clean river sand and moisten with water twice a day."},
                    {"step": 4, "title": "Insulated Jute Cover", "details": "Cover top with a damp triple-layer woven jute burlap bag to facilitate continuous evaporative cooling.", "audio_text": "Cover the top with a damp jute sack to enable continuous evaporative cooling."},
                ],
                "materials": [
                    {"item_name": "Large Exterior Terracotta Pot", "quantity": "1 Unit", "unit_cost": Decimal("550.00"), "local_source": "Village Potter (Kumhar)", "optimized_alternative": "Locally kiln-fired clay pot", "estimated_savings": Decimal("150.00")},
                    {"item_name": "Inner Food Storage Clay Pot", "quantity": "1 Unit", "unit_cost": Decimal("400.00"), "local_source": "Village Potter", "optimized_alternative": "Locally kiln-fired inner pot", "estimated_savings": Decimal("100.00")},
                    {"item_name": "Washed Coarse River Sand (40kg)", "quantity": "1 Bag", "unit_cost": Decimal("250.00"), "local_source": "River Bed / Construction", "optimized_alternative": "Sifted local riverbank sand", "estimated_savings": Decimal("150.00")},
                    {"item_name": "Treated Jute Burlap Sacks", "quantity": "2 Bags", "unit_cost": Decimal("250.00"), "local_source": "Grain Wholesale Mandi", "optimized_alternative": "Discarded wheat bags", "estimated_savings": Decimal("150.00")},
                ]
            },
        ]

        created_inventions = []
        for inv_data in inventions_data:
            now = datetime.utcnow()
            creator = inv_data["creator"]
            steps = inv_data["steps"]
            mats = inv_data["materials"]

            fingerprint_content = f"{creator.id}|{inv_data['title']}|{inv_data['category']}|{inv_data['region']}|{now.isoformat()}|{json.dumps(steps)}"
            sha_hash = calculate_sha256(fingerprint_content)

            inv = Invention(
                creator_id=creator.id,
                title=inv_data["title"],
                category=inv_data["category"],
                region=inv_data["region"],
                scaling_stage=inv_data.get("scaling_stage", "RAW_PROTOTYPE"),
                description=inv_data["description"],
                assembly_steps=steps,
                total_cost=inv_data["total_cost"],
                image_url=inv_data["image_url"],
                blueprint_url=inv_data.get("blueprint_url"),
                sketch_url=inv_data.get("sketch_url"),
                video_url=inv_data.get("video_url"),
                sha256_hash=sha_hash,
                submission_timestamp=now - timedelta(days=20),
                moderation_status="APPROVED",
                safety_score=inv_data["safety_score"],
                durability_notes=inv_data["durability_notes"],
                field_tested=inv_data["field_tested"],
                estimated_co2_savings_kg=inv_data["co2"],
                estimated_water_savings_liters=inv_data["water"],
                views_count=142,
                created_at=now - timedelta(days=20),
            )
            db.add(inv)
            db.flush()
            created_inventions.append(inv)

            for m in mats:
                mat = InventionMaterial(
                    invention_id=inv.id,
                    item_name=m["item_name"],
                    quantity=m["quantity"],
                    unit_cost=m["unit_cost"],
                    local_source=m["local_source"],
                    optimized_alternative=m["optimized_alternative"],
                    estimated_savings=m["estimated_savings"],
                )
                db.add(mat)

        print("Seeding reviews & ratings...")
        rev1 = ReviewRating(
            invention_id=created_inventions[0].id,
            user_id=u_kavita.id,
            rating=5,
            comment="Built this solar drip kit for my 1-acre chili plot in Bihar. Cut water use in half and our yield grew 20%!",
        )
        rev2 = ReviewRating(
            invention_id=created_inventions[0].id,
            user_id=u_mentor.id,
            rating=5,
            comment="Exceptional frugal hydraulics. The gravity head calculations and disc filter choice are robust for rural field waters.",
        )
        rev3 = ReviewRating(
            invention_id=created_inventions[1].id,
            user_id=u_suresh.id,
            rating=4,
            comment="The chain gear ratio is comfortable for continuous pedaling. Recommended adding grease nipples on the bearing blocks.",
        )
        db.add_all([rev1, rev2, rev3])

        print("Seeding telemetry sensor logs...")
        telemetries = [
            TelemetryLog(invention_id=created_inventions[0].id, power_watts=Decimal("38.40"), runtime_hours=Decimal("6.50"), efficiency_percentage=Decimal("94.20"), ambient_temp_c=Decimal("34.50"), recorded_at=datetime.utcnow() - timedelta(hours=2)),
            TelemetryLog(invention_id=created_inventions[0].id, power_watts=Decimal("41.20"), runtime_hours=Decimal("5.80"), efficiency_percentage=Decimal("96.10"), ambient_temp_c=Decimal("36.10"), recorded_at=datetime.utcnow() - timedelta(hours=26)),
            TelemetryLog(invention_id=created_inventions[0].id, power_watts=Decimal("39.00"), runtime_hours=Decimal("7.10"), efficiency_percentage=Decimal("93.80"), ambient_temp_c=Decimal("33.20"), recorded_at=datetime.utcnow() - timedelta(hours=50)),
            TelemetryLog(invention_id=created_inventions[2].id, power_watts=Decimal("24.10"), runtime_hours=Decimal("8.00"), efficiency_percentage=Decimal("91.50"), ambient_temp_c=Decimal("31.00"), recorded_at=datetime.utcnow() - timedelta(hours=4)),
        ]
        db.add_all(telemetries)

        print("Seeding replications...")
        replications = [
            Replication(
                invention_id=created_inventions[0].id,
                builder_id=u_kavita.id,
                location="Madhubani SHG Farm",
                state="Bihar",
                photo_url="/images/inventions/solar-drip.svg",
                notes="Replicated with 15 women farmers. Installed on 8 vegetable polyhouses.",
                build_cost=Decimal("3100.00"),
                created_at=datetime.utcnow() - timedelta(days=12),
            ),
            Replication(
                invention_id=created_inventions[0].id,
                builder_id=u_suresh.id,
                location="Kumbakonam Agro Hub",
                state="Tamil Nadu",
                photo_url="/images/inventions/solar-drip.svg",
                notes="Tested on jasmine flower farming. Significant labor reduction.",
                build_cost=Decimal("3350.00"),
                created_at=datetime.utcnow() - timedelta(days=8),
            ),
            Replication(
                invention_id=created_inventions[1].id,
                builder_id=u_kavita.id,
                location="Saharsa Krishi Kendra",
                state="Bihar",
                photo_url="/images/inventions/bicycle-thresher.svg",
                notes="Pedal thresher built using local scrap roadster cycle. Works seamlessly.",
                build_cost=Decimal("4600.00"),
                created_at=datetime.utcnow() - timedelta(days=5),
            ),
        ]
        db.add_all(replications)

        print("Seeding funding pledges...")
        pledges = [
            FundingPledge(
                invention_id=created_inventions[0].id,
                donor_id=u_ananya.id,
                donor_name=u_ananya.full_name,
                donor_email=u_ananya.email,
                pledge_type="MONETARY",
                amount=Decimal("25000.00"),
                status="ACCEPTED",
                notes="Grant to provide 8 drip kits for tribal women farmers in Dahod, Gujarat.",
            ),
            FundingPledge(
                invention_id=created_inventions[3].id,
                donor_id=u_anita.id,
                donor_name=u_anita.full_name,
                donor_email=u_anita.email,
                pledge_type="SPARE_PARTS",
                amount=Decimal("15000.00"),
                spare_part_details="Donating 10 industrial hydraulic bottle jacks (8-ton rating) and high-tensile fasteners.",
                status="PLEDGED",
                notes="Supporting briquetting deployment in Cauvery delta.",
            ),
        ]
        db.add_all(pledges)

        print("Seeding commercial buy/rent/license offers from officials...")
        offers = [
            CommercialOffer(
                invention_id=created_inventions[0].id,
                inventor_id=u_ramesh.id,
                official_id=u_ananya.id,
                official_name="Ananya Sengupta (Director)",
                organization_name="Gujarat State Horticulture Mission (Govt of Gujarat)",
                official_email=u_ananya.email,
                official_phone=u_ananya.phone,
                offer_type="RENT",
                proposed_amount=Decimal("18000.00"),
                rental_duration_months=6,
                message="We would like to rent 5 field-tested units of your Solar Drip Kit for our pilot demonstration at Dahod Krishi Vigyan Kendra. Official government MoU and rental stipend guaranteed.",
                status="PENDING",
            ),
            CommercialOffer(
                invention_id=created_inventions[2].id,
                inventor_id=u_kavita.id,
                official_id=u_vikram.id,
                official_name="Vikram Deshmukh (Chief General Manager)",
                organization_name="NABARD Rural Innovation Fund",
                official_email=u_vikram.email,
                official_phone=u_vikram.phone,
                offer_type="BUY",
                proposed_amount=Decimal("45000.00"),
                rental_duration_months=None,
                message="Direct purchase order for 15 vibratory seed grader prototypes to distribute to Women Farmer Producer Organizations across Bihar. We would like to schedule a field inspection.",
                status="ACCEPTED",
            ),
            CommercialOffer(
                invention_id=created_inventions[3].id,
                inventor_id=u_suresh.id,
                official_id=u_admin.id,
                official_name="Meera Nambiar (TEDA Technology Cell)",
                organization_name="Tamil Nadu Energy Development Agency (TEDA)",
                official_email=u_admin.email,
                official_phone=u_admin.phone,
                offer_type="LICENSE",
                proposed_amount=Decimal("75000.00"),
                rental_duration_months=12,
                message="Proposal to license your hydraulic briquette press design for district-level rural entrepreneurship training clusters across Thanjavur and Tiruchirappalli.",
                status="NEGOTIATING",
            ),
        ]
        db.add_all(offers)

        print("Seeding direct investor pitches...")
        pitches = [
            Pitch(
                inventor_id=u_ramesh.id,
                investor_id=u_vikram.id,
                invention_id=created_inventions[0].id,
                pitch_title="Scale Solar Drip Kits across 20 Tribal Villages in Dahod",
                pitch_notes="We have field-tested our solar micro-drip kit across 8 chili and tomato plots with 65% water savings. We seek ₹2,50,000 grant funding to pre-fabricate and install 20 kits with Dahod Women Farmer Collectives.",
                funding_needed=Decimal("250000.00"),
                status="UNDER_REVIEW",
                feedback_notes="Impressive field data. Scheduling virtual technical review with our Gujarat Regional Office.",
            ),
            Pitch(
                inventor_id=u_kavita.id,
                investor_id=u_ananya.id,
                invention_id=created_inventions[2].id,
                pitch_title="Self-Help Group Mass Adoption for Pulse Sorting",
                pitch_notes="Seeking ₹1,80,000 seed investment to manufacture 15 solar vibratory pulse seed graders for Jeevika SHG clusters in Madhubani and Saharsa.",
                funding_needed=Decimal("180000.00"),
                status="ACCEPTED",
                feedback_notes="Approved for full pilot grant under Pragati Rural Seed Fund Phase 2.",
            ),
            Pitch(
                inventor_id=u_suresh.id,
                investor_id=u_anita.id,
                invention_id=created_inventions[3].id,
                pitch_title="Commercial Briquette Manufacturing Center in Cauvery Delta",
                pitch_notes="Requesting ₹4,00,000 debt/grant facility to establish a village-level agro-waste processing unit converting paddy straw into clean smokeless cooking logs.",
                funding_needed=Decimal("400000.00"),
                status="SUBMITTED",
            ),
        ]
        db.add_all(pitches)

        print("Seeding community problem bounties...")
        bounties = [
            Bounty(
                poster_id=u_ramesh.id,
                title="Ergonomic Cotton Boll Plucker with Solar Waist Pack",
                description="Smallholder cotton farmers suffer severe spinal fatigue and knuckle cuts from 10-hour daily manual boll picking. We need a lightweight hand tool (<400g) powered by a small 12V waist pack battery that detaches cotton bolls cleanly without pulling leaf bracts.",
                region="Gujarat",
                reward_amount=Decimal("35000.00"),
                status="OPEN",
                deadline=datetime.utcnow() + timedelta(days=45),
            ),
            Bounty(
                poster_id=u_kavita.id,
                title="Low-Cost Solar Cold-Box for Perishable Tomatoes",
                description="During winter glut, tomatoes sell for under 2 rupees per kilo because of lack of cold storage. Need an evaporative or solar peltier micro-cooler keeping 100 kg crates at 12-15C for at least 7 days in Bihar villages.",
                region="Bihar",
                reward_amount=Decimal("50000.00"),
                status="OPEN",
                deadline=datetime.utcnow() + timedelta(days=60),
            ),
            Bounty(
                poster_id=u_suresh.id,
                title="De-stoner Machine for Finger Millet (Ragi)",
                description="Small gravel and clay particles mix with finger millet during field threshing. Need a small vibratory air-flotation de-stoner that works on single phase 1 HP motor or pedal power with capacity of 50 kg/hour.",
                region="Tamil Nadu",
                reward_amount=Decimal("25000.00"),
                status="OPEN",
                deadline=datetime.utcnow() + timedelta(days=30),
            ),
        ]
        db.add_all(bounties)
        db.flush()

        b_sub = BountySubmission(
            bounty_id=bounties[1].id,
            invention_id=created_inventions[7].id,  # Clay Pot cooler
            innovator_id=u_ramesh.id,
            note="Our double-walled terracotta cooling chamber design can be scaled up to 100 kg capacity using prefabricated terracotta modular bricks.",
            status="SUBMITTED",
        )
        db.add(b_sub)

        print("Seeding verified rural workshops & makerspaces...")
        workshops = [
            Workshop(
                name="Vigyan Ashram Fab Lab",
                type="FabLab",
                address="Village Pabal, Shirur Taluka",
                city_village="Pabal",
                state="Maharashtra",
                pincode="412403",
                latitude=Decimal("18.8322000"),
                longitude=Decimal("74.0531000"),
                contact_phone="+91 94223 12345",
                contact_email="pabal@vigyanashram.com",
                available_tools=["CNC Plasma Cutter", "3D Printers", "TIG/MIG Welding", "Lathe & Milling Machine", "Solar Testing Rig"],
            ),
            Workshop(
                name="Gramodaya Frugal Makerspace",
                type="VillageWorkshop",
                address="Near Amul Dairy Road, Anand Rural",
                city_village="Anand",
                state="Gujarat",
                pincode="388001",
                latitude=Decimal("22.5645000"),
                longitude=Decimal("72.9289000"),
                contact_phone="+91 98251 67890",
                contact_email="makerspace@anandagro.org",
                available_tools=["Arc Welding 250A", "Power Hacksaw", "Pipe Bender", "Drill Press", "Hydraulic Press 15T"],
            ),
            Workshop(
                name="Delta Farmers Tool Library & Fabrication Center",
                type="ToolLibrary",
                address="Kallanai Road, Thanjavur District",
                city_village="Thanjavur",
                state="Tamil Nadu",
                pincode="613001",
                latitude=Decimal("10.7870000"),
                longitude=Decimal("79.1378000"),
                contact_phone="+91 98421 98765",
                contact_email="delta.tools@ruralhub.org",
                available_tools=["Paddy Weeder Dies", "Blacksmith Anvil & Blower", "Angle Grinders", "Sheet Metal Shear"],
            ),
            Workshop(
                name="Mithila Innovation Fab Lab",
                type="PolytechnicMakerSpace",
                address="Govt Polytechnic Campus, Madhubani",
                city_village="Madhubani",
                state="Bihar",
                pincode="847211",
                latitude=Decimal("26.3540000"),
                longitude=Decimal("86.0722000"),
                contact_phone="+91 94311 23456",
                contact_email="mithila.fablab@bihartech.org",
                available_tools=["PCB Milling Machine", "Laser Cutter 80W", "Soldering Stations", "3D Printer Ender-3"],
            ),
            Workshop(
                name="Malwa Agri Hardware Prototyping Hub",
                type="VillageWorkshop",
                address="GT Road, Ludhiana Outer Bypass",
                city_village="Ludhiana",
                state="Punjab",
                pincode="141001",
                latitude=Decimal("30.9010000"),
                longitude=Decimal("75.8573000"),
                contact_phone="+91 98140 11223",
                contact_email="malwa.proto@punjabagro.org",
                available_tools=["Heavy Lathe 8-foot", "Rotary Balancer", "Induction Hardening Unit", "MIG Welder 300A"],
            ),
        ]
        db.add_all(workshops)

        print("Seeding feature flags...")
        flags = [
            FeatureFlag(name="ai_voice_guide", enabled=True, description="Enables text-to-speech audio guidance for multi-step assembly instructions"),
            FeatureFlag(name="offline_sync", enabled=True, description="Enables IndexedDB local draft preservation and background synchronization"),
            FeatureFlag(name="licensing_drafts", enabled=True, description="Allows instant generation of grassroots open-hardware licensing agreements"),
            FeatureFlag(name="iot_telemetry", enabled=True, description="Enables live sensor ingestion and runtime efficiency charts for field equipment"),
            FeatureFlag(name="ultra_lite_mode", enabled=True, description="Permits low-bandwidth optimization toggle suppressing animations & high-res media"),
            FeatureFlag(name="investor_pitching", enabled=True, description="Enables direct pitch deck submissions to registered impact investors"),
        ]
        db.add_all(flags)

        db.commit()
        print("Database seeding completed successfully! All demo records, inventions with matching visuals, pitches, and workshops created.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
