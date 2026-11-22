import json
import re
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc
from app.core.security import calculate_sha256
from app.models.invention import Invention
from app.models.material import InventionMaterial
from app.models.review import ReviewRating
from app.models.replication import Replication
from app.models.pledge import FundingPledge
from app.models.user import User
from app.models.social import InventionLike, InventionComment
from app.models.commercial_offer import CommercialOffer
from app.schemas.invention import (
    InventionCreate,
    InventionUpdate,
    InventionResponse,
    InventionDetailResponse,
    InventionLikeResponse,
    CommentResponse,
    CommentCreate,
    ReviewCreate,
    ReviewResponse,
    MaterialItem,
    MaterialResponse,
    SimilarityCheckRequest,
    SimilarityCheckResponse,
    SimilarityMatch,
    MaterialOptimizeRequest,
    MaterialOptimizeResponse,
    InventionCertificateResponse,
)


class InventionService:
    @staticmethod
    def compute_safety_score(steps: List[Any], materials: List[MaterialItem], description: str) -> Tuple[int, str]:
        """
        Rule-based safety scoring matrix:
        Assesses electrical danger, high-pressure vessels, unshielded blades, and chemical hazards.
        """
        base_score = 95
        deductions = []

        all_text = (description + " " + " ".join([m.item_name for m in materials]) + " " + json.dumps(steps)).lower()

        if any(term in all_text for term in ["high voltage", "220v", "ac mains", "live wire"]):
            base_score -= 15
            deductions.append("High-voltage electrical mains risk: Requires insulated gloves and residual current breaker.")
        if any(term in all_text for term in ["pressure cooker", "compressed air tank", "boiler", "steam pressure"]):
            base_score -= 12
            deductions.append("Pressurized container: Must install certified safety relief valve calibrated under 5 PSI.")
        if any(term in all_text for term in ["cutter blade", "saw blade", "spinning disc", "sharp edges"]):
            base_score -= 10
            deductions.append("Rotating cutting blades: Sheet metal safety shroud/guard is strongly recommended.")
        if any(term in all_text for term in ["pesticide", "acid", "battery lead", "caustic"]):
            base_score -= 10
            deductions.append("Chemical toxicity: Wear chemical-resistant gloves, goggles, and face shield.")

        notes = " | ".join(deductions) if deductions else "Standard low-risk hand tools and low-voltage mechanical components."
        final_score = max(50, min(100, base_score))
        return final_score, notes

    @staticmethod
    def create_invention(db: Session, creator_id: int, req: InventionCreate) -> Invention:
        # Check for duplicate invention by this exact creator
        existing = (
            db.query(Invention)
            .filter(
                Invention.creator_id == creator_id,
                func.lower(Invention.title) == req.title.strip().lower(),
                Invention.is_deleted == False,
            )
            .first()
        )
        if existing:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"You have already submitted an innovation titled '{req.title.strip()}'. Please modify the title or update your existing blueprint.",
            )

        # Calculate materials total cost safely
        materials_list = req.materials or []
        total_cost = sum((m.unit_cost or Decimal("0.00")) for m in materials_list)

        # Rule-based safety score
        serialized_steps = [s.model_dump() if hasattr(s, "model_dump") else dict(s) for s in (req.assembly_steps or [])]
        safety_score, safety_notes = InventionService.compute_safety_score(serialized_steps, materials_list, req.description or "")

        clean_region = (req.region or "Gujarat").strip()
        clean_desc = (req.description or "Frugal engineering innovation developed for rural community benefit.").strip()

        # SHA-256 fingerprint of the complete content + timestamp for provenance proof
        now = datetime.utcnow()
        fingerprint_content = f"{creator_id}|{req.title}|{req.category}|{clean_region}|{now.isoformat()}|{json.dumps(serialized_steps)}"
        sha256_hash = calculate_sha256(fingerprint_content)

        invention = Invention(
            creator_id=creator_id,
            title=req.title.strip(),
            category=req.category or "Agriculture",
            region=clean_region,
            description=clean_desc,
            assembly_steps=serialized_steps,
            total_cost=total_cost,
            image_url=req.image_url or "/images/inventions/solar-drip.svg",
            video_url=req.video_url,
            blueprint_url=req.blueprint_url or "/images/blueprints/solar-drip-blueprint.svg",
            sketch_url=req.sketch_url or "/images/blueprints/solar-drip-blueprint.svg",
            sha256_hash=sha256_hash,
            submission_timestamp=now,
            moderation_status="APPROVED",
            safety_score=safety_score,
            durability_notes=req.durability_notes or safety_notes,
            field_tested=False,
            scaling_stage=req.scaling_stage or "RAW_PROTOTYPE",
            estimated_co2_savings_kg=req.estimated_co2_savings_kg or Decimal("120.00"),
            estimated_water_savings_liters=req.estimated_water_savings_liters or Decimal("5000.00"),
            created_at=now,
        )
        db.add(invention)
        db.flush()

        # Add materials
        for m in materials_list:
            mat = InventionMaterial(
                invention_id=invention.id,
                item_name=m.item_name or "Hardware Component",
                quantity=m.quantity or "1 Unit",
                unit_cost=m.unit_cost or Decimal("0.00"),
                local_source=m.local_source,
                optimized_alternative=m.optimized_alternative,
                estimated_savings=m.estimated_savings or Decimal("0.00"),
            )
            db.add(mat)

        db.commit()
        db.refresh(invention)
        return invention

    @staticmethod
    def get_inventions(
        db: Session,
        keyword: Optional[str] = None,
        category: Optional[str] = None,
        region: Optional[str] = None,
        max_cost: Optional[float] = None,
        sort_by: Optional[str] = "newest",
        status: Optional[str] = "APPROVED",
        current_user_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[InventionResponse]:
        query = db.query(Invention).filter(Invention.is_deleted == False)

        if status:
            query = query.filter(Invention.moderation_status == status)

        if keyword:
            term = f"%{keyword.strip()}%"
            query = query.filter(
                or_(
                    Invention.title.ilike(term),
                    Invention.description.ilike(term),
                    Invention.region.ilike(term),
                )
            )

        if category and category != "All":
            query = query.filter(Invention.category == category)

        if region and region != "All":
            query = query.filter(Invention.region.ilike(f"%{region.strip()}%"))

        if max_cost is not None and max_cost > 0:
            query = query.filter(Invention.total_cost <= Decimal(str(max_cost)))

        # Sorting
        if sort_by == "cost_asc":
            query = query.order_by(Invention.total_cost.asc())
        elif sort_by == "cost_desc":
            query = query.order_by(Invention.total_cost.desc())
        elif sort_by in ["popular", "views_desc"]:
            query = query.order_by(Invention.views_count.desc(), Invention.created_at.desc())
        elif sort_by == "oldest":
            query = query.order_by(Invention.created_at.asc())
        elif sort_by == "title_asc":
            query = query.order_by(Invention.title.asc())
        elif sort_by == "title_desc":
            query = query.order_by(Invention.title.desc())
        elif sort_by == "innovator_asc":
            query = query.join(User, Invention.creator_id == User.id).order_by(User.full_name.asc(), Invention.created_at.desc())
        elif sort_by in ["most_liked", "likes_desc"]:
            like_counts = (
                db.query(InventionLike.invention_id, func.count(InventionLike.id).label("l_count"))
                .group_by(InventionLike.invention_id)
                .subquery()
            )
            query = query.outerjoin(like_counts, Invention.id == like_counts.c.invention_id).order_by(
                func.coalesce(like_counts.c.l_count, 0).desc(), Invention.created_at.desc()
            )
        elif sort_by == "field_tested":
            query = query.order_by(Invention.field_tested.desc(), Invention.created_at.desc())
        else:
            # Default: newest first (decreasing order of date)
            query = query.order_by(Invention.created_at.desc())

        inventions = query.offset(skip).limit(limit * 2).all()

        # Deduplicate: Strict rule: Don't keep repeated invention by the same person.
        # It can be posted by different people, but never repeated by the same creator.
        seen_creator_titles = set()
        deduped_inventions = []
        for inv in inventions:
            key = (inv.creator_id, inv.title.strip().lower())
            if key not in seen_creator_titles:
                seen_creator_titles.add(key)
                deduped_inventions.append(inv)
                if len(deduped_inventions) >= limit:
                    break

        results = []
        for inv in deduped_inventions:
            # Aggregates
            avg_rating = db.query(func.avg(ReviewRating.rating)).filter(ReviewRating.invention_id == inv.id).scalar() or 0.0
            rev_count = db.query(func.count(ReviewRating.id)).filter(ReviewRating.invention_id == inv.id).scalar() or 0
            rep_count = db.query(func.count(Replication.id)).filter(Replication.invention_id == inv.id).scalar() or 0
            pledged = db.query(func.sum(FundingPledge.amount)).filter(FundingPledge.invention_id == inv.id, FundingPledge.status != "CANCELLED").scalar() or Decimal("0.00")
            likes_cnt = db.query(func.count(InventionLike.id)).filter(InventionLike.invention_id == inv.id).scalar() or 0
            comments_cnt = db.query(func.count(InventionComment.id)).filter(InventionComment.invention_id == inv.id).scalar() or 0
            paid_reuses_cnt = db.query(func.count(CommercialOffer.id)).filter(
                CommercialOffer.invention_id == inv.id,
                or_(
                    CommercialOffer.status.in_(["ACCEPTED", "PAID", "Accepted", "Paid"]),
                    CommercialOffer.offer_type.in_(["PAID_REUSE", "Paid Reuse", "BUY", "RENT", "Buy", "Rent"])
                )
            ).scalar() or 0

            is_liked = False
            if current_user_id:
                is_liked = db.query(InventionLike.id).filter(
                    InventionLike.invention_id == inv.id,
                    InventionLike.user_id == current_user_id
                ).first() is not None

            creator = db.query(User).filter(User.id == inv.creator_id).first()

            results.append(
                InventionResponse(
                    id=inv.id,
                    creator_id=inv.creator_id,
                    creator_name=creator.full_name if creator else "Grassroots Innovator",
                    creator_state=creator.state if creator else inv.region,
                    creator_photo_url=creator.profile_photo_url if creator else None,
                    creator_village_city=creator.village_city if creator else None,
                    creator_phone=creator.phone if creator else None,
                    creator_bio=creator.bio if creator else None,
                    creator_verified=creator.verified if creator else False,
                    title=inv.title,
                    category=inv.category,
                    region=inv.region,
                    description=inv.description,
                    total_cost=inv.total_cost,
                    currency=inv.currency,
                    image_url=inv.image_url,
                    video_url=inv.video_url,
                    blueprint_url=inv.blueprint_url,
                    sketch_url=inv.sketch_url,
                    sha256_hash=inv.sha256_hash,
                    moderation_status=inv.moderation_status,
                    rejection_reason=inv.rejection_reason,
                    safety_score=inv.safety_score,
                    durability_notes=inv.durability_notes,
                    field_tested=inv.field_tested,
                    scaling_stage=inv.scaling_stage or "RAW_PROTOTYPE",
                    estimated_co2_savings_kg=inv.estimated_co2_savings_kg,
                    estimated_water_savings_liters=inv.estimated_water_savings_liters,
                    views_count=inv.views_count,
                    average_rating=round(float(avg_rating), 1),
                    reviews_count=rev_count,
                    replications_count=rep_count,
                    total_pledged=pledged,
                    likes_count=likes_cnt,
                    comments_count=comments_cnt,
                    paid_reuses_count=paid_reuses_cnt,
                    is_liked_by_me=is_liked,
                    created_at=inv.created_at,
                )
            )

        return results

    @staticmethod
    def get_invention_detail(db: Session, invention_id: int, current_user_id: Optional[int] = None) -> Optional[InventionDetailResponse]:
        inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
        if not inv:
            return None

        # Increment view count
        inv.views_count = (inv.views_count or 0) + 1
        db.commit()
        db.refresh(inv)

        creator = db.query(User).filter(User.id == inv.creator_id).first()
        avg_rating = db.query(func.avg(ReviewRating.rating)).filter(ReviewRating.invention_id == inv.id).scalar() or 0.0
        rev_count = db.query(func.count(ReviewRating.id)).filter(ReviewRating.invention_id == inv.id).scalar() or 0
        rep_count = db.query(func.count(Replication.id)).filter(Replication.invention_id == inv.id).scalar() or 0
        pledged = db.query(func.sum(FundingPledge.amount)).filter(FundingPledge.invention_id == inv.id, FundingPledge.status != "CANCELLED").scalar() or Decimal("0.00")
        likes_cnt = db.query(func.count(InventionLike.id)).filter(InventionLike.invention_id == inv.id).scalar() or 0
        comments_cnt = db.query(func.count(InventionComment.id)).filter(InventionComment.invention_id == inv.id).scalar() or 0
        paid_reuses_cnt = db.query(func.count(CommercialOffer.id)).filter(
            CommercialOffer.invention_id == inv.id,
            or_(
                CommercialOffer.status.in_(["ACCEPTED", "PAID", "Accepted", "Paid"]),
                CommercialOffer.offer_type.in_(["PAID_REUSE", "Paid Reuse", "BUY", "RENT", "Buy", "Rent"])
            )
        ).scalar() or 0

        is_liked = False
        if current_user_id:
            is_liked = db.query(InventionLike.id).filter(
                InventionLike.invention_id == inv.id,
                InventionLike.user_id == current_user_id
            ).first() is not None

        # Materials
        materials = [MaterialResponse.model_validate(m) for m in inv.materials]

        # Reviews
        reviews_list = []
        for r in inv.reviews:
            r_user = db.query(User).filter(User.id == r.user_id).first()
            reviews_list.append(
                ReviewResponse(
                    id=r.id,
                    invention_id=r.invention_id,
                    user_id=r.user_id,
                    user_name=r_user.full_name if r_user else "Farmer / Reviewer",
                    rating=r.rating,
                    comment=r.comment,
                    created_at=r.created_at,
                )
            )

        return InventionDetailResponse(
            id=inv.id,
            creator_id=inv.creator_id,
            creator_name=creator.full_name if creator else "Grassroots Innovator",
            creator_state=creator.state if creator else inv.region,
            creator_photo_url=creator.profile_photo_url if creator else None,
            creator_village_city=creator.village_city if creator else None,
            creator_phone=creator.phone if creator else None,
            creator_bio=creator.bio if creator else None,
            creator_verified=creator.verified if creator else False,
            title=inv.title,
            category=inv.category,
            region=inv.region,
            description=inv.description,
            total_cost=inv.total_cost,
            currency=inv.currency,
            image_url=inv.image_url,
            video_url=inv.video_url,
            blueprint_url=inv.blueprint_url,
            sketch_url=inv.sketch_url,
            sha256_hash=inv.sha256_hash,
            moderation_status=inv.moderation_status,
            rejection_reason=inv.rejection_reason,
            safety_score=inv.safety_score,
            durability_notes=inv.durability_notes,
            field_tested=inv.field_tested,
            scaling_stage=inv.scaling_stage or "RAW_PROTOTYPE",
            estimated_co2_savings_kg=inv.estimated_co2_savings_kg,
            estimated_water_savings_liters=inv.estimated_water_savings_liters,
            views_count=inv.views_count,
            average_rating=round(float(avg_rating), 1),
            reviews_count=rev_count,
            replications_count=rep_count,
            total_pledged=pledged,
            likes_count=likes_cnt,
            comments_count=comments_cnt,
            paid_reuses_count=paid_reuses_cnt,
            is_liked_by_me=is_liked,
            created_at=inv.created_at,
            assembly_steps=inv.assembly_steps,
            materials=materials,
            reviews=reviews_list,
        )

    @staticmethod
    def toggle_like(db: Session, invention_id: int, user_id: int) -> Tuple[bool, int]:
        inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
        if not inv:
            raise HTTPException(status_code=404, detail="Invention not found")

        existing = db.query(InventionLike).filter(
            InventionLike.invention_id == invention_id,
            InventionLike.user_id == user_id,
        ).first()

        if existing:
            db.delete(existing)
            db.commit()
            liked = False
        else:
            new_like = InventionLike(invention_id=invention_id, user_id=user_id, created_at=datetime.utcnow())
            db.add(new_like)
            db.commit()
            liked = True

        count = db.query(func.count(InventionLike.id)).filter(InventionLike.invention_id == invention_id).scalar() or 0
        return liked, count

    @staticmethod
    def get_comments(db: Session, invention_id: int) -> List[CommentResponse]:
        inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
        if not inv:
            raise HTTPException(status_code=404, detail="Invention not found")

        comments = db.query(InventionComment).filter(
            InventionComment.invention_id == invention_id
        ).order_by(InventionComment.created_at.asc()).all()

        results = []
        for c in comments:
            u = db.query(User).filter(User.id == c.user_id).first()
            results.append(
                CommentResponse(
                    id=c.id,
                    invention_id=c.invention_id,
                    user_id=c.user_id,
                    user_name=u.full_name if u else "Community Member",
                    user_username=u.username if u else None,
                    user_role=u.role if u else "INNOVATOR",
                    user_photo_url=u.profile_photo_url if u else None,
                    comment_text=c.comment_text,
                    created_at=c.created_at,
                )
            )
        return results

    @staticmethod
    def add_comment(db: Session, invention_id: int, user_id: int, comment_text: str) -> CommentResponse:
        inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
        if not inv:
            raise HTTPException(status_code=404, detail="Invention not found")

        clean_text = comment_text.strip()
        if not clean_text:
            raise HTTPException(status_code=400, detail="Comment text cannot be empty")

        comment = InventionComment(
            invention_id=invention_id,
            user_id=user_id,
            comment_text=clean_text,
            created_at=datetime.utcnow(),
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)

        u = db.query(User).filter(User.id == user_id).first()
        return CommentResponse(
            id=comment.id,
            invention_id=comment.invention_id,
            user_id=comment.user_id,
            user_name=u.full_name if u else "Community Member",
            user_username=u.username if u else None,
            user_role=u.role if u else "INNOVATOR",
            user_photo_url=u.profile_photo_url if u else None,
            comment_text=comment.comment_text,
            created_at=comment.created_at,
        )

    @staticmethod
    def check_similarity(db: Session, req: SimilarityCheckRequest) -> SimilarityCheckResponse:
        """
        Heuristic rule-based similarity check using word-token overlap and Jaccard distance.
        """
        words_in = set(re.findall(r"\w+", (req.title + " " + req.description).lower()))
        words_in = {w for w in words_in if len(w) > 3}

        existing_inventions = db.query(Invention).filter(Invention.is_deleted == False).all()
        matches = []

        for item in existing_inventions:
            item_words = set(re.findall(r"\w+", (item.title + " " + item.description).lower()))
            item_words = {w for w in item_words if len(w) > 3}
            if not words_in or not item_words:
                continue

            intersection = len(words_in.intersection(item_words))
            union = len(words_in.union(item_words))
            score = round((intersection / union) * 100, 1)

            if score > 20.0:
                matches.append(
                    SimilarityMatch(
                        id=item.id,
                        title=item.title,
                        category=item.category,
                        score=score,
                        description_snippet=item.description[:140] + "...",
                    )
                )

        matches.sort(key=lambda m: m.score, reverse=True)
        top_matches = matches[:5]
        msg = f"Found {len(top_matches)} similar inventions. Your innovation appears distinct and novel!" if len(top_matches) == 0 else f"Found {len(top_matches)} related concepts in the hub. Check them to ensure novelty and potential collaboration."
        return SimilarityCheckResponse(matches=top_matches, message=msg)

    @staticmethod
    def optimize_materials(req: MaterialOptimizeRequest) -> MaterialOptimizeResponse:
        """
        Rule-based material cost optimizer suggesting recycled, locally fabricated alternatives.
        """
        substitutions = {
            "mild steel pipe": ("Discarded bicycle frame tube / GI pipe offcut", Decimal("0.40")),
            "steel tube": ("Discarded bicycle frame tube / GI pipe offcut", Decimal("0.40")),
            "bearing": ("Reconditioned auto alternator bearing", Decimal("0.50")),
            "motor": ("Rewound ceiling fan / washing machine motor", Decimal("0.45")),
            "sheet metal": ("Upcycled oil drum sheet / roofing tin", Decimal("0.60")),
            "tank": ("Food-grade discarded plastic storage drum (200L)", Decimal("0.55")),
            "nozzle": ("Brass gas stove jet repurposed with needle drill", Decimal("0.70")),
            "pulley": ("Cast iron scooter hub", Decimal("0.50")),
            "valve": ("Repurposed brass ball valve from plumbing scrap", Decimal("0.45")),
        }

        original_total = sum(m.unit_cost for m in req.materials)
        optimized_suggestions = []
        total_savings = Decimal("0.00")

        for item in req.materials:
            name_lower = item.item_name.lower()
            matched = False
            for key, (alt, saving_pct) in substitutions.items():
                if key in name_lower:
                    savings = (item.unit_cost * saving_pct).quantize(Decimal("0.01"))
                    new_cost = item.unit_cost - savings
                    total_savings += savings
                    optimized_suggestions.append(
                        MaterialItem(
                            item_name=item.item_name,
                            quantity=item.quantity,
                            unit_cost=new_cost,
                            local_source="Local Scrap / Scrap Dealer / Auto Repair Shop",
                            optimized_alternative=alt,
                            estimated_savings=savings,
                        )
                    )
                    matched = True
                    break
            if not matched:
                optimized_suggestions.append(item)

        optimized_total = original_total - total_savings

        return MaterialOptimizeResponse(
            original_total=original_total,
            optimized_total=optimized_total,
            potential_savings=total_savings,
            suggestions=optimized_suggestions,
            rationale="Heuristic local material optimization: Identified upcycled scrap components and local workshop substitutes that reduce fabrication cost without compromising structural integrity.",
        )

    @staticmethod
    def generate_certificate(db: Session, invention_id: int) -> InventionCertificateResponse:
        inv = db.query(Invention).filter(Invention.id == invention_id, Invention.is_deleted == False).first()
        if not inv:
            return None

        creator = db.query(User).filter(User.id == inv.creator_id).first()

        return InventionCertificateResponse(
            certificate_id=f"RIH-CERT-{inv.id:05d}-{inv.created_at.strftime('%Y%m')}",
            invention_id=inv.id,
            title=inv.title,
            creator_name=creator.full_name if creator else "Grassroots Innovator",
            creator_location=f"{creator.village_city or ''}, {creator.state or inv.region}",
            sha256_hash=inv.sha256_hash,
            submission_timestamp=inv.submission_timestamp,
            category=inv.category,
            field_tested=inv.field_tested,
            safety_score=inv.safety_score,
            verification_url=f"https://ruralhub.org/verify/{inv.sha256_hash}",
            disclaimer="This certificate documents prior publication and cryptographic tamper-proof timestamping of the open-hardware invention. It serves as prior art evidence under community copyright and open-source hardware principles.",
        )
