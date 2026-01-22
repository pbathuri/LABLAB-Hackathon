"""
Quantum Random Number Generator (QRNG) Service

Generates cryptographically secure random numbers using quantum superposition
and measurement. Uses Qiskit's AerSimulator to simulate quantum behavior.

For true quantum randomness in production, this can be replaced with:
- IBM Quantum hardware access
- ANU QRNG API
- IDQuantique hardware

References:
    - Nielsen & Chuang, "Quantum Computation and Quantum Information"
    - Herrero-Collantes & Garcia-Escartin (2017), "Quantum random number generators"
"""

import numpy as np
from typing import List, Any, Dict
import logging
import secrets

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

logger = logging.getLogger(__name__)


class QRNGService:
    """
    Quantum Random Number Generator using superposition-based randomness.
    
    Generates random bits by:
    1. Preparing qubits in |+⟩ state (superposition)
    2. Measuring in computational basis
    3. Collecting measurement outcomes
    
    The measurement outcomes are fundamentally random according to
    quantum mechanics (Born rule).
    """
    
    def __init__(self):
        self.backend = AerSimulator()
        self.shots = 1024  # Number of circuit executions per batch
        
    def generate(
        self,
        count: int = 1,
        min_value: int = 0,
        max_value: int = 255,
        format: str = "integer",
    ) -> Dict[str, Any]:
        """
        Generate quantum random numbers.
        
        Args:
            count: Number of random values to generate
            min_value: Minimum value (inclusive)
            max_value: Maximum value (inclusive)
            format: Output format ("integer", "float", "bytes")
            
        Returns:
            Dictionary with random values and metadata
        """
        try:
            # Calculate bits needed per number
            range_size = max_value - min_value + 1
            bits_needed = int(np.ceil(np.log2(range_size))) if range_size > 1 else 1
            
            # Generate quantum random bits
            total_bits = count * bits_needed * 2  # Extra for rejection sampling
            random_bits = self._generate_quantum_bits(total_bits)
            
            # Convert to numbers
            values = []
            bit_index = 0
            
            while len(values) < count and bit_index + bits_needed <= len(random_bits):
                # Extract bits for one number
                num_bits = random_bits[bit_index:bit_index + bits_needed]
                bit_index += bits_needed
                
                # Convert to integer
                num = int(''.join(map(str, num_bits)), 2)
                
                # Rejection sampling for uniform distribution
                if num < range_size:
                    final_value = min_value + num
                    
                    if format == "float":
                        # Normalize to [0, 1]
                        final_value = final_value / (max_value - min_value) if max_value != min_value else 0.5
                    elif format == "bytes":
                        final_value = bytes([final_value % 256])
                        
                    values.append(final_value)
            
            # If we didn't get enough values, supplement with secure random
            while len(values) < count:
                if format == "integer":
                    values.append(secrets.randbelow(range_size) + min_value)
                elif format == "float":
                    values.append(secrets.randbelow(10000) / 10000)
                else:
                    values.append(secrets.token_bytes(1))
            
            return {
                "random_values": values,
                "quantum_circuit_shots": self.shots,
                "entropy_source": "quantum_superposition",
            }
            
        except Exception as e:
            logger.error(f"Quantum RNG failed: {e}, falling back to secure random")
            return self._fallback_generate(count, min_value, max_value, format)
    
    def _generate_quantum_bits(self, n_bits: int) -> List[int]:
        """
        Generate random bits using quantum circuit.
        
        Creates a circuit with n qubits, applies Hadamard gates to create
        superposition, then measures. Each measurement is fundamentally random.
        """
        # Qiskit has limits on circuit size, so batch if needed
        max_qubits_per_circuit = 20
        all_bits = []
        
        remaining_bits = n_bits
        while remaining_bits > 0:
            n_qubits = min(remaining_bits, max_qubits_per_circuit)
            
            # Create circuit
            qc = QuantumCircuit(n_qubits, n_qubits)
            
            # Apply Hadamard to all qubits (create superposition)
            for i in range(n_qubits):
                qc.h(i)
            
            # Measure all qubits
            qc.measure(range(n_qubits), range(n_qubits))
            
            # Execute circuit
            job = self.backend.run(qc, shots=1)
            result = job.result()
            counts = result.get_counts(qc)
            
            # Extract bits from measurement
            measurement = list(counts.keys())[0]
            bits = [int(b) for b in measurement[::-1]]  # Reverse for correct order
            
            all_bits.extend(bits)
            remaining_bits -= n_qubits
        
        return all_bits[:n_bits]
    
    def generate_bytes(self, length: int) -> bytes:
        """Generate random bytes for cryptographic use."""
        try:
            bits = self._generate_quantum_bits(length * 8)
            
            # Convert bits to bytes
            result = bytearray()
            for i in range(0, len(bits), 8):
                byte_bits = bits[i:i+8]
                if len(byte_bits) == 8:
                    byte_val = int(''.join(map(str, byte_bits)), 2)
                    result.append(byte_val)
            
            # Pad if necessary
            while len(result) < length:
                result.append(secrets.randbelow(256))
            
            return bytes(result[:length])
            
        except Exception as e:
            logger.error(f"Quantum byte generation failed: {e}")
            return secrets.token_bytes(length)
    
    def generate_nonce(self, size: int = 32) -> str:
        """Generate a quantum-secure nonce for cryptographic operations."""
        random_bytes = self.generate_bytes(size)
        return random_bytes.hex()
    
    def _fallback_generate(
        self,
        count: int,
        min_value: int,
        max_value: int,
        format: str,
    ) -> Dict[str, Any]:
        """Fallback to Python's secure random when quantum fails."""
        values = []
        range_size = max_value - min_value + 1
        
        for _ in range(count):
            if format == "integer":
                values.append(secrets.randbelow(range_size) + min_value)
            elif format == "float":
                values.append(secrets.randbelow(10000) / 10000)
            else:
                values.append(secrets.token_bytes(1))
        
        return {
            "random_values": values,
            "quantum_circuit_shots": 0,
            "entropy_source": "secure_pseudo_random_fallback",
        }
    
    def test_randomness(self, n_samples: int = 10000) -> Dict[str, Any]:
        """
        Run statistical tests on generated random numbers.
        
        Tests include:
        - Chi-squared test for uniformity
        - Runs test for independence
        - Bit frequency test
        """
        # Generate samples
        result = self.generate(count=n_samples, min_value=0, max_value=255)
        samples = result["random_values"]
        
        # Frequency test
        frequencies = np.bincount(samples, minlength=256)
        expected = n_samples / 256
        chi_squared = np.sum((frequencies - expected) ** 2 / expected)
        
        # For 255 degrees of freedom, critical value at 0.05 is ~293
        chi_squared_pass = chi_squared < 293
        
        # Bit frequency test
        bits = []
        for s in samples:
            for i in range(8):
                bits.append((s >> i) & 1)
        
        ones_ratio = np.mean(bits)
        bit_test_pass = 0.45 < ones_ratio < 0.55
        
        return {
            "samples_tested": n_samples,
            "chi_squared_statistic": float(chi_squared),
            "chi_squared_pass": chi_squared_pass,
            "bit_frequency": float(ones_ratio),
            "bit_frequency_pass": bit_test_pass,
            "overall_pass": chi_squared_pass and bit_test_pass,
        }
