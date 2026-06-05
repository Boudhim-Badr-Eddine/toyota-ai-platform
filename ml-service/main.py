"""
Toyota Morocco — ML Marketing Service
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
FastAPI microservice exposing marketing prediction endpoints.
Deploy to Railway.app; the Next.js app proxies via /api/ml-predict.
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from model import get_model

load_dotenv()

# ─── Pydantic I/O models ──────────────────────────────────────────────────────

class CampaignInput(BaseModel):
    vehicle_category: str = Field(..., min_length=1, examples=["SUV Familial"])
    price_range: str = Field(..., min_length=1, examples=["200000-350000"])
    season: str = Field(..., examples=["summer"])
    target_segment: str = Field(..., examples=["families"])

    @field_validator("season")
    @classmethod
    def validate_season(cls, v: str) -> str:
        allowed = {"spring", "summer", "autumn", "winter"}
        if v not in allowed:
            raise ValueError(f"season must be one of {allowed}")
        return v

    @field_validator("target_segment")
    @classmethod
    def validate_segment(cls, v: str) -> str:
        allowed = {"families", "young", "professional", "adventure"}
        if v not in allowed:
            raise ValueError(f"target_segment must be one of {allowed}")
        return v


class CampaignOutput(BaseModel):
    campaign_type: str
    channel: str
    budget_allocation: int
    predicted_roi: float
    message_theme: str
    confidence: float


# ─── Lead analysis I/O ────────────────────────────────────────────────────────

class LeadRecord(BaseModel):
    vehicle_category: str = ""
    price_range: str = "200000-350000"
    season: str = "spring"
    target_segment: str = "families"
    status: str = "new"
    type: str = "test_drive"


class LeadInsights(BaseModel):
    total_leads: int
    conversion_rate: float
    top_category: str
    top_segment: str
    recommendations: list[str]
    predicted_campaigns: list[dict[str, Any]]


# ─── App lifecycle ────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[type-arg]
    # Pre-load model on startup so first request is fast
    get_model()
    yield


app = FastAPI(
    title="Toyota Morocco ML Service",
    version="1.0.0",
    description="Marketing campaign prediction and lead analytics for Toyota Morocco.",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ───────────────────────────────────────────────────────────────────


@app.get("/health", tags=["meta"])
async def health_check() -> dict[str, str]:
    """Liveness check — confirms model is loaded."""
    model = get_model()
    loaded = model.campaign_clf is not None
    return {"status": "ok", "model": "loaded" if loaded else "unloaded"}


@app.post(
    "/predict-campaign",
    response_model=CampaignOutput,
    tags=["predictions"],
    summary="Predict optimal marketing campaign",
)
async def predict_campaign(data: CampaignInput) -> CampaignOutput:
    """
    Given a vehicle category, price range, season, and target segment,
    return the optimal marketing campaign configuration with predicted ROI.
    """
    try:
        model = get_model()
        result = model.predict(
            vehicle_category=data.vehicle_category,
            price_range=data.price_range,
            season=data.season,
            target_segment=data.target_segment,
        )
        return CampaignOutput(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


@app.post(
    "/analyze-leads",
    response_model=LeadInsights,
    tags=["analytics"],
    summary="Analyze a batch of leads and return insights",
)
async def analyze_leads(leads: list[LeadRecord]) -> LeadInsights:
    """
    Accepts a list of lead records and returns aggregate insights:
    conversion rate, top categories, and per-segment campaign recommendations.
    """
    if not leads:
        raise HTTPException(status_code=422, detail="leads array must not be empty")

    try:
        total = len(leads)

        # Conversion rate
        converted = sum(1 for l in leads if l.status == "converted")
        conversion_rate = round(converted / total * 100, 1)

        # Top category
        category_counts: dict[str, int] = {}
        for lead in leads:
            cat = lead.vehicle_category or "Unknown"
            category_counts[cat] = category_counts.get(cat, 0) + 1
        top_category = max(category_counts, key=category_counts.__getitem__)

        # Top segment
        segment_counts: dict[str, int] = {}
        for lead in leads:
            seg = lead.target_segment or "Unknown"
            segment_counts[seg] = segment_counts.get(seg, 0) + 1
        top_segment = max(segment_counts, key=segment_counts.__getitem__)

        # Textual recommendations
        recommendations: list[str] = [
            f"Concentrez vos efforts sur le segment '{top_segment}' — il représente {segment_counts[top_segment]} leads.",
            f"Le modèle '{top_category}' génère le plus d'intérêt ({category_counts[top_category]} leads).",
        ]
        if conversion_rate < 20:
            recommendations.append(
                "Taux de conversion faible (<20%) — envisagez un suivi téléphonique plus rapide."
            )
        elif conversion_rate > 50:
            recommendations.append(
                "Excellent taux de conversion (>50%) — renforcez le budget sur les canaux actuels."
            )

        # Generate one predicted campaign per unique segment
        model = get_model()
        seen_segments: set[str] = set()
        predicted_campaigns: list[dict[str, Any]] = []
        for lead in leads:
            seg = lead.target_segment
            if seg not in seen_segments:
                seen_segments.add(seg)
                pred = model.predict(
                    vehicle_category=lead.vehicle_category or top_category,
                    price_range=lead.price_range,
                    season=lead.season,
                    target_segment=seg,
                )
                pred["target_segment"] = seg
                predicted_campaigns.append(pred)

        return LeadInsights(
            total_leads=total,
            conversion_rate=conversion_rate,
            top_category=top_category,
            top_segment=top_segment,
            recommendations=recommendations,
            predicted_campaigns=predicted_campaigns,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc
