'use client';

import { useState } from 'react';
import {
    ArrowRight,
    ArrowLeft,
    Atom,
    ShieldCheck,
    Zap,
    Wallet,
    CheckCircle2,
    Sparkles,
    Bot
} from 'lucide-react';

interface OnboardingFlowProps {
    onComplete: () => void;
    onSkip: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            id: 0,
            title: "Welcome to Captain Whiskers",
            description: "Your quantum-powered AI treasury companion",
            icon: <Bot size={32} className="text-[#00D9FF]" />,
            features: [
                "AI-powered treasury management",
                "Quantum-enhanced optimization",
                "Trustless verification"
            ],
        },
        {
            id: 1,
            title: "Quantum Treasury Optimization",
            description: "Leverage cutting-edge quantum algorithms for portfolio optimization",
            icon: <Atom size={32} className="text-[#7B61FF]" />,
            features: [
                "VQE algorithm for optimal returns",
                "Risk-adjusted optimization",
                "Real-time rebalancing suggestions"
            ],
        },
        {
            id: 2,
            title: "Trustless Verification",
            description: "Every decision verified by Byzantine Fault Tolerant consensus",
            icon: <ShieldCheck size={32} className="text-[#00FF94]" />,
            features: [
                "11 independent verifier nodes",
                "Requires 7+ signatures",
                "On-chain audit trail"
            ],
        },
        {
            id: 3,
            title: "Post-Quantum Security",
            description: "Future-proof cryptography protecting your assets",
            icon: <Zap size={32} className="text-[#FFB800]" />,
            features: [
                "CRYSTALS-Dilithium signatures",
                "Quantum random number generation",
                "EIP-712 typed data signing"
            ],
        },
        {
            id: 4,
            title: "Connect Your Wallet",
            description: "Securely link your wallet to get started",
            icon: <Wallet size={32} className="text-[#00D9FF]" />,
            features: [
                "MetaMask & WalletConnect support",
                "Arc testnet integration",
                "USDC settlement via Circle"
            ],
        }
    ];

    const currentStepData = steps[currentStep];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0A0E17] z-50 flex flex-col overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#00D9FF]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#7B61FF]/5 rounded-full blur-3xl" />
            </div>

            {/* Skip button */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={onSkip}
                    className="text-sm text-[#8892A7] hover:text-white transition-colors"
                >
                    Skip
                </button>
            </div>

            {/* Progress indicator */}
            <div className="px-6 pt-12">
                <div className="flex items-center gap-2 justify-center">
                    {steps.map((step, i) => (
                        <div
                            key={step.id}
                            className={`h-1 rounded-full transition-all duration-300 ${i <= currentStep ? 'w-8 bg-gradient-to-r from-[#00D9FF] to-[#7B61FF]' : 'w-4 bg-[#151C2C]'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
                {/* Mascot */}
                <div className="mb-6 text-6xl">🐱‍🚀</div>

                {/* Icon */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#00D9FF]/10 to-[#7B61FF]/10 border border-[#00D9FF]/20 mb-6">
                    {currentStepData.icon}
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
                    {currentStepData.title}
                </h2>
                <p className="text-[#8892A7] text-center mb-6 max-w-md">
                    {currentStepData.description}
                </p>

                {/* Features */}
                <div className="w-full max-w-sm space-y-2">
                    {currentStepData.features.map((feature, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-3 bg-[#0F1629] rounded-xl border border-[#00D9FF]/10"
                        >
                            <CheckCircle2 size={16} className="text-[#00FF94] flex-shrink-0" />
                            <span className="text-sm text-[#8892A7]">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="p-6 border-t border-[#00D9FF]/10 bg-[#0A0E17]/90 backdrop-blur-xl">
                <div className="flex items-center gap-4 max-w-sm mx-auto">
                    {currentStep > 0 && (
                        <button
                            onClick={handlePrev}
                            className="flex-1 py-3 px-6 rounded-xl border border-[#00D9FF]/30 text-[#00D9FF] font-medium hover:bg-[#00D9FF]/10 transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] text-white font-medium hover:shadow-lg hover:shadow-[#00D9FF]/30 transition-all flex items-center justify-center gap-2"
                    >
                        {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                        {currentStep < steps.length - 1 && <ArrowRight size={18} />}
                        {currentStep === steps.length - 1 && <Sparkles size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
