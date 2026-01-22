"""
Captain Whiskers - Quantum Treasury Service

A FastAPI service providing quantum portfolio optimization,
quantum random number generation, and post-quantum cryptography.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn

from quantum.portfolio_optimizer import PortfolioOptimizer
from quantum.qrng_service import QRNGService
from crypto.dilithium_service import DilithiumService

app = FastAPI(
    title="Captain Whiskers Quantum Service",
    description="Quantum portfolio optimization and post-quantum cryptography",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
portfolio_optimizer = PortfolioOptimizer()
qrng_service = QRNGService()
dilithium_service = DilithiumService()


# === Request/Response Models ===

class PortfolioOptimizationRequest(BaseModel):
    """Request for portfolio optimization"""
    assets: List[str]  # Asset symbols
    expected_returns: List[float]  # Expected return for each asset
    covariance_matrix: List[List[float]]  # Covariance matrix
    risk_tolerance: float = 0.5  # 0 (min risk) to 1 (max return)
    budget: float = 1.0  # Total budget to allocate
    constraints: Optional[Dict[str, Any]] = None


class PortfolioOptimizationResponse(BaseModel):
    """Response from portfolio optimization"""
    allocations: Dict[str, float]
    expected_return: float
    expected_risk: float
    sharpe_ratio: float
    quantum_circuit_depth: int
    optimization_iterations: int
    convergence_achieved: bool


class QRNGRequest(BaseModel):
    """Request for quantum random numbers"""
    count: int = 1
    min_value: int = 0
    max_value: int = 255
    format: str = "integer"  # "integer", "float", "bytes"


class QRNGResponse(BaseModel):
    """Response with quantum random numbers"""
    random_values: List[Any]
    quantum_circuit_shots: int
    entropy_source: str


class SigningRequest(BaseModel):
    """Request for post-quantum signature"""
    message: str
    private_key_hex: str


class SignatureResponse(BaseModel):
    """Response with signature"""
    signature_hex: str
    algorithm: str
    key_size: int


class VerifyRequest(BaseModel):
    """Request for signature verification"""
    message: str
    signature_hex: str
    public_key_hex: str


class KeyPairResponse(BaseModel):
    """Response with key pair"""
    public_key_hex: str
    private_key_hex: str
    algorithm: str


# === Portfolio Optimization Endpoints ===

@app.post("/quantum/optimize-portfolio", response_model=PortfolioOptimizationResponse)
async def optimize_portfolio(request: PortfolioOptimizationRequest):
    """
    Perform quantum portfolio optimization using VQE (Variational Quantum Eigensolver).
    
    Uses quadratic programming formulation:
    min w^T Σ w - μ · w^T r
    subject to: sum(w) = budget, w >= 0
    
    Where:
    - w: allocation weights
    - Σ: covariance matrix
    - r: expected returns
    - μ: risk aversion (derived from risk_tolerance)
    """
    try:
        result = portfolio_optimizer.optimize(
            assets=request.assets,
            expected_returns=request.expected_returns,
            covariance_matrix=request.covariance_matrix,
            risk_tolerance=request.risk_tolerance,
            budget=request.budget,
            constraints=request.constraints,
        )
        return PortfolioOptimizationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/quantum/analyze-risk")
async def analyze_risk(request: PortfolioOptimizationRequest):
    """
    Perform quantum-enhanced risk analysis using amplitude estimation.
    """
    try:
        result = portfolio_optimizer.analyze_risk(
            assets=request.assets,
            expected_returns=request.expected_returns,
            covariance_matrix=request.covariance_matrix,
            allocations=None,  # Will use optimal allocations
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# === Quantum Random Number Generation ===

@app.post("/quantum/random", response_model=QRNGResponse)
async def generate_random(request: QRNGRequest):
    """
    Generate cryptographically secure random numbers using quantum circuits.
    
    Uses superposition and measurement to generate true random numbers.
    Falls back to secure pseudo-random if quantum simulator fails.
    """
    try:
        result = qrng_service.generate(
            count=request.count,
            min_value=request.min_value,
            max_value=request.max_value,
            format=request.format,
        )
        return QRNGResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/quantum/random/bytes/{length}")
async def generate_random_bytes(length: int):
    """Generate random bytes for cryptographic nonces."""
    if length > 1024:
        raise HTTPException(status_code=400, detail="Max length is 1024 bytes")
    
    result = qrng_service.generate_bytes(length)
    return {"bytes_hex": result.hex(), "length": length}


# === Post-Quantum Cryptography ===

@app.post("/crypto/dilithium/keypair", response_model=KeyPairResponse)
async def generate_keypair():
    """
    Generate a CRYSTALS-Dilithium key pair for post-quantum signatures.
    
    Dilithium is a lattice-based digital signature scheme selected by NIST
    for post-quantum cryptography standardization.
    """
    try:
        keypair = dilithium_service.generate_keypair()
        return KeyPairResponse(**keypair)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/crypto/dilithium/sign", response_model=SignatureResponse)
async def sign_message(request: SigningRequest):
    """Sign a message using CRYSTALS-Dilithium."""
    try:
        result = dilithium_service.sign(
            message=request.message,
            private_key_hex=request.private_key_hex,
        )
        return SignatureResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/crypto/dilithium/verify")
async def verify_signature(request: VerifyRequest):
    """Verify a CRYSTALS-Dilithium signature."""
    try:
        is_valid = dilithium_service.verify(
            message=request.message,
            signature_hex=request.signature_hex,
            public_key_hex=request.public_key_hex,
        )
        return {"valid": is_valid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/crypto/eip712/sign")
async def sign_eip712(typed_data: Dict[str, Any], private_key_hex: str):
    """
    Sign EIP-712 typed data using post-quantum signature.
    
    Generates signature compatible with x402 micropayment protocol.
    """
    try:
        result = dilithium_service.sign_eip712(
            typed_data=typed_data,
            private_key_hex=private_key_hex,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# === Health Check ===

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "quantum_backend": "aer_simulator",
        "crypto_algorithm": "CRYSTALS-Dilithium",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
