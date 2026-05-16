"""
Toyota Morocco — Marketing Prediction Model
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Trains on synthetic data that mirrors real Toyota Morocco sales patterns.
Predicts optimal campaign type, channel, budget allocation, and ROI for a
given vehicle category / price range / season / target segment combination.
"""

from __future__ import annotations

import os
import random
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder

# ─── Paths ────────────────────────────────────────────────────────────────────

MODEL_DIR = Path(__file__).parent / "saved_models"
MODEL_DIR.mkdir(exist_ok=True)

CLASSIFIER_PATH = MODEL_DIR / "campaign_classifier.joblib"
ROI_REGRESSOR_PATH = MODEL_DIR / "roi_regressor.joblib"
BUDGET_REGRESSOR_PATH = MODEL_DIR / "budget_regressor.joblib"
ENCODERS_PATH = MODEL_DIR / "encoders.joblib"

# ─── Domain knowledge tables ──────────────────────────────────────────────────

VEHICLE_CATEGORIES = [
    "Sport",
    "SUV Familial",
    "Citadine",
    "Compacte Hybride",
    "Berline Confort",
    "Tout-terrain extrême",
    "Pick-up utilitaire",
    "Éco/Tech",
    "SUV Urbain",
    "SUV 7 places",
]

PRICE_RANGES = [
    "0-200000",
    "200000-350000",
    "350000-550000",
    "550000+",
]

SEASONS = ["spring", "summer", "autumn", "winter"]

TARGET_SEGMENTS = ["families", "young", "professional", "adventure"]

CAMPAIGN_TYPES = [
    "Digital Social",
    "Influencer",
    "Search & Display",
    "Event Marketing",
    "Email Campaign",
    "TV & Radio",
    "Outdoor",
]

CHANNELS = [
    "Instagram + Facebook",
    "YouTube + TikTok",
    "Google Ads + Display",
    "LinkedIn + Email",
    "Radio + Outdoor",
    "TV + Digital",
    "Event + Showroom",
]

MESSAGE_THEMES = [
    "Aventure Familiale",
    "Performance & Adrénaline",
    "Éco-mobilité Intelligente",
    "Luxe & Confort",
    "Urban Lifestyle",
    "Robustesse & Fiabilité",
    "Innovation Technologique",
    "Rapport Qualité-Prix",
]

# ─── Heuristic rules used to shape synthetic data ─────────────────────────────
# These encode Toyota Morocco marketing expertise so the model learns
# plausible patterns rather than pure random noise.

def _heuristic_campaign(category: str, segment: str, season: str) -> str:
    if segment == "young":
        return random.choices(["Digital Social", "Influencer"], weights=[0.6, 0.4])[0]
    if segment == "families":
        if season in ("spring", "summer"):
            return random.choices(["TV & Radio", "Outdoor", "Event Marketing"], weights=[0.4, 0.3, 0.3])[0]
        return random.choices(["TV & Radio", "Email Campaign"], weights=[0.6, 0.4])[0]
    if segment == "professional":
        return random.choices(["Search & Display", "Email Campaign", "LinkedIn + Email"], weights=[0.5, 0.3, 0.2])[0]
    if segment == "adventure":
        return random.choices(["Outdoor", "Event Marketing", "Digital Social"], weights=[0.4, 0.3, 0.3])[0]
    return random.choice(CAMPAIGN_TYPES)


def _heuristic_channel(campaign_type: str) -> str:
    mapping: dict[str, list[str]] = {
        "Digital Social": ["Instagram + Facebook", "YouTube + TikTok"],
        "Influencer": ["Instagram + Facebook", "YouTube + TikTok"],
        "Search & Display": ["Google Ads + Display"],
        "Event Marketing": ["Event + Showroom"],
        "Email Campaign": ["LinkedIn + Email"],
        "TV & Radio": ["TV + Digital", "Radio + Outdoor"],
        "Outdoor": ["Radio + Outdoor", "Event + Showroom"],
    }
    options = mapping.get(campaign_type, CHANNELS)
    return random.choice(options)


def _heuristic_budget(price_range: str, campaign_type: str) -> float:
    base: dict[str, float] = {
        "0-200000": 20.0,
        "200000-350000": 30.0,
        "350000-550000": 40.0,
        "550000+": 50.0,
    }
    campaign_bonus: dict[str, float] = {
        "TV & Radio": 10.0,
        "Outdoor": 8.0,
        "Event Marketing": 12.0,
        "Digital Social": -5.0,
        "Influencer": 0.0,
    }
    b = base.get(price_range, 30.0) + campaign_bonus.get(campaign_type, 0.0)
    return round(float(np.clip(b + random.gauss(0, 3), 10, 70)), 1)


def _heuristic_roi(
    category: str,
    price_range: str,
    season: str,
    segment: str,
    budget: float,
) -> float:
    base = 2.0
    if season in ("spring", "summer"):
        base += 0.4
    if segment == "young" and category in ("Citadine", "SUV Urbain", "Sport"):
        base += 0.5
    if segment == "families" and category in ("SUV Familial", "SUV 7 places"):
        base += 0.6
    if segment == "professional" and category in ("Berline Confort", "Compacte Hybride"):
        base += 0.4
    if segment == "adventure" and category in ("Tout-terrain extrême", "Pick-up utilitaire"):
        base += 0.7
    if price_range == "550000+":
        base -= 0.3  # premium vehicles have longer sales cycles
    roi = base + random.gauss(0, 0.25)
    return round(float(np.clip(roi, 0.5, 5.0)), 2)


def _heuristic_theme(category: str, segment: str) -> str:
    theme_map: dict[str, str] = {
        ("Sport", "young"): "Performance & Adrénaline",
        ("Sport", "professional"): "Performance & Adrénaline",
        ("SUV Familial", "families"): "Aventure Familiale",
        ("SUV 7 places", "families"): "Aventure Familiale",
        ("Citadine", "young"): "Urban Lifestyle",
        ("SUV Urbain", "young"): "Urban Lifestyle",
        ("Éco/Tech", "young"): "Éco-mobilité Intelligente",
        ("Éco/Tech", "professional"): "Innovation Technologique",
        ("Compacte Hybride", "professional"): "Éco-mobilité Intelligente",
        ("Berline Confort", "professional"): "Luxe & Confort",
        ("Tout-terrain extrême", "adventure"): "Robustesse & Fiabilité",
        ("Pick-up utilitaire", "adventure"): "Robustesse & Fiabilité",
        ("Pick-up utilitaire", "professional"): "Robustesse & Fiabilité",
    }
    return theme_map.get((category, segment), random.choice(MESSAGE_THEMES))


def _heuristic_confidence(roi: float, budget: float) -> float:
    # Confidence grows with ROI and penalises extreme budget allocations
    c = 0.6 + (roi - 1.0) * 0.06 - abs(budget - 35) * 0.002
    return round(float(np.clip(c + random.gauss(0, 0.04), 0.55, 0.97)), 2)


# ─── Synthetic data generator ─────────────────────────────────────────────────

def generate_synthetic_data(n: int = 500) -> pd.DataFrame:
    random.seed(42)
    np.random.seed(42)

    rows: list[dict[str, Any]] = []
    for _ in range(n):
        category = random.choice(VEHICLE_CATEGORIES)
        price_range = random.choice(PRICE_RANGES)
        season = random.choice(SEASONS)
        segment = random.choice(TARGET_SEGMENTS)

        campaign_type = _heuristic_campaign(category, segment, season)
        channel = _heuristic_channel(campaign_type)
        budget = _heuristic_budget(price_range, campaign_type)
        roi = _heuristic_roi(category, price_range, season, segment, budget)
        theme = _heuristic_theme(category, segment)
        confidence = _heuristic_confidence(roi, budget)

        rows.append(
            {
                "vehicle_category": category,
                "price_range": price_range,
                "season": season,
                "target_segment": segment,
                "campaign_type": campaign_type,
                "channel": channel,
                "budget_allocation": budget,
                "predicted_roi": roi,
                "message_theme": theme,
                "confidence": confidence,
            }
        )
    return pd.DataFrame(rows)


# ─── Model class ──────────────────────────────────────────────────────────────

class MarketingPredictionModel:
    """
    Wraps four sklearn models:
      - campaign_clf   → RandomForestClassifier → campaign_type
      - channel_clf    → RandomForestClassifier → channel
      - budget_reg     → RandomForestRegressor  → budget_allocation
      - roi_reg        → RandomForestRegressor  → predicted_roi

    Feature encoders (LabelEncoder per categorical feature) are stored
    alongside the models so prediction reuses identical encoding.
    """

    FEATURE_COLS = ["vehicle_category", "price_range", "season", "target_segment"]

    def __init__(self) -> None:
        self.campaign_clf: RandomForestClassifier | None = None
        self.channel_clf: RandomForestClassifier | None = None
        self.budget_reg: RandomForestRegressor | None = None
        self.roi_reg: RandomForestRegressor | None = None
        self.encoders: dict[str, LabelEncoder] = {}
        self._theme_lookup: dict[tuple[str, str], str] = {}

    # ── Encoding helpers ──────────────────────────────────────────────────────

    def _fit_encoders(self, df: pd.DataFrame) -> None:
        for col in self.FEATURE_COLS:
            le = LabelEncoder()
            le.fit(df[col])
            self.encoders[col] = le

    def _encode_features(self, df: pd.DataFrame) -> np.ndarray:
        encoded = np.column_stack(
            [self.encoders[col].transform(df[col]) for col in self.FEATURE_COLS]
        )
        return encoded

    def _encode_single(self, row: dict[str, str]) -> np.ndarray:
        """Encode a single prediction input, handling unseen labels gracefully."""
        encoded = []
        for col in self.FEATURE_COLS:
            le = self.encoders[col]
            val = row[col]
            if val in le.classes_:
                encoded.append(le.transform([val])[0])
            else:
                # Fallback to first known class
                encoded.append(0)
        return np.array(encoded, dtype=float).reshape(1, -1)

    # ── Train ─────────────────────────────────────────────────────────────────

    def train(self, n_samples: int = 500) -> None:
        print(f"[ML] Generating {n_samples} synthetic training samples…")
        df = generate_synthetic_data(n_samples)

        self._fit_encoders(df)
        X = self._encode_features(df)

        # Build theme lookup from training data
        for _, row in df.iterrows():
            key = (row["vehicle_category"], row["target_segment"])
            self._theme_lookup[key] = row["message_theme"]

        # Campaign type classifier
        self.campaign_clf = RandomForestClassifier(
            n_estimators=100, max_depth=8, random_state=42
        )
        self.campaign_clf.fit(X, df["campaign_type"])

        # Channel classifier
        self.channel_clf = RandomForestClassifier(
            n_estimators=100, max_depth=8, random_state=42
        )
        self.channel_clf.fit(X, df["channel"])

        # Budget regressor
        self.budget_reg = RandomForestRegressor(
            n_estimators=100, max_depth=8, random_state=42
        )
        self.budget_reg.fit(X, df["budget_allocation"])

        # ROI regressor
        self.roi_reg = RandomForestRegressor(
            n_estimators=100, max_depth=8, random_state=42
        )
        self.roi_reg.fit(X, df["predicted_roi"])

        self._save()
        print("[ML] Training complete — models saved.")

    # ── Persistence ───────────────────────────────────────────────────────────

    def _save(self) -> None:
        joblib.dump(self.campaign_clf, CLASSIFIER_PATH)
        joblib.dump(self.roi_reg, ROI_REGRESSOR_PATH)
        joblib.dump(self.budget_reg, BUDGET_REGRESSOR_PATH)
        joblib.dump(
            {
                "encoders": self.encoders,
                "theme_lookup": self._theme_lookup,
            },
            ENCODERS_PATH,
        )

    def _load(self) -> bool:
        if not all(
            p.exists()
            for p in [
                CLASSIFIER_PATH,
                ROI_REGRESSOR_PATH,
                BUDGET_REGRESSOR_PATH,
                ENCODERS_PATH,
            ]
        ):
            return False
        self.campaign_clf = joblib.load(CLASSIFIER_PATH)
        self.roi_reg = joblib.load(ROI_REGRESSOR_PATH)
        self.budget_reg = joblib.load(BUDGET_REGRESSOR_PATH)
        meta = joblib.load(ENCODERS_PATH)
        self.encoders = meta["encoders"]
        self._theme_lookup = meta["theme_lookup"]
        # channel_clf added later; handle missing gracefully
        if BUDGET_REGRESSOR_PATH.exists():
            try:
                self.channel_clf = joblib.load(BUDGET_REGRESSOR_PATH.parent / "channel_classifier.joblib")
            except Exception:
                self.channel_clf = None
        print("[ML] Models loaded from disk.")
        return True

    def ensure_loaded(self) -> None:
        """Load from disk or train if no saved model exists."""
        if self.campaign_clf is not None:
            return
        if not self._load():
            self.train()

    # ── Predict ───────────────────────────────────────────────────────────────

    def predict(
        self,
        vehicle_category: str,
        price_range: str,
        season: str,
        target_segment: str,
    ) -> dict[str, Any]:
        self.ensure_loaded()

        row = {
            "vehicle_category": vehicle_category,
            "price_range": price_range,
            "season": season,
            "target_segment": target_segment,
        }
        X = self._encode_single(row)

        # Classifications
        campaign_type: str = str(self.campaign_clf.predict(X)[0])  # type: ignore[union-attr]

        # Channel: use channel_clf if available, else heuristic
        if self.channel_clf is not None:
            channel: str = str(self.channel_clf.predict(X)[0])
        else:
            channel = _heuristic_channel(campaign_type)

        # Regressions (clipped to valid ranges)
        budget_raw: float = float(self.budget_reg.predict(X)[0])  # type: ignore[union-attr]
        budget_allocation = round(float(np.clip(budget_raw, 10, 70)), 1)

        roi_raw: float = float(self.roi_reg.predict(X)[0])  # type: ignore[union-attr]
        predicted_roi = round(float(np.clip(roi_raw, 0.5, 5.0)), 2)

        # Message theme (lookup → heuristic fallback → random)
        theme = self._theme_lookup.get(
            (vehicle_category, target_segment),
            _heuristic_theme(vehicle_category, target_segment),
        )

        confidence = _heuristic_confidence(predicted_roi, budget_allocation)

        return {
            "campaign_type": campaign_type,
            "channel": channel,
            "budget_allocation": int(budget_allocation),
            "predicted_roi": predicted_roi,
            "message_theme": theme,
            "confidence": confidence,
        }


# ─── Module-level singleton ────────────────────────────────────────────────────

_model: MarketingPredictionModel | None = None


def get_model() -> MarketingPredictionModel:
    global _model
    if _model is None:
        _model = MarketingPredictionModel()
        _model.ensure_loaded()
    return _model


# ─── CLI entrypoint (python model.py → retrain) ───────────────────────────────

if __name__ == "__main__":
    m = MarketingPredictionModel()
    m.train(n_samples=500)
    sample = m.predict("SUV Familial", "200000-350000", "summer", "families")
    print("Sample prediction:", sample)
