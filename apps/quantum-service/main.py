"""
Captain Whiskers V2 — quantum / portfolio helper service (FastAPI).
Optional: extend with Qiskit VQE when dependencies are added.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Captain Whiskers Quantum Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "quantum"}


@app.get("/optimize")
def optimize_placeholder():
    """Placeholder for portfolio optimization — Nest backend may call this."""
    return {
        "weights": {"BTC": 0.4, "ETH": 0.35, "SOL": 0.25},
        "method": "risk-parity-placeholder",
    }
