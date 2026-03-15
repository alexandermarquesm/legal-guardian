import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, Zap } from "lucide-react";
import "./styles.css";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
}) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const packages = [
    {
      id: "starter",
      name: "Starter",
      credits: 1,
      price: 49,
      pricePerUnit: 49,
      features: [
        "Single Contract Analysis",
        "Basic Risk Detection",
        "Standard Support",
      ],
      highlight: false,
    },
    {
      id: "professional",
      name: "Professional",
      credits: 5,
      price: 195,
      pricePerUnit: 39,
      save: "20%",
      features: [
        "5 Analyses Included",
        "Deep Risk Detection",
        "AI Negotiation Drafts",
      ],
      highlight: true, // Best Value
    },
    {
      id: "power",
      name: "Power User",
      credits: 10,
      price: 290,
      pricePerUnit: 29,
      save: "40%",
      features: [
        "10 Analyses Included",
        "Deep Risk Detection",
        "Priority Support",
      ],
      highlight: false,
    },
  ];

  const handlePurchase = async (pkgId: string) => {
    setIsLoading(pkgId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageId: pkgId,
            successUrl:
              window.location.origin + "?payment_success=true&pkg=" + pkgId,
            cancelUrl: window.location.origin + "?payment_canceled=true",
          }),
        },
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned", data);
        alert("Payment initialization failed. Check console.");
        setIsLoading(null);
      }
    } catch (error) {
      console.error("Payment Error:", error);
      setIsLoading(null);
      alert("Failed to connect to payment server.");
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="pricing-modal wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="pricing-header">
          <div className="icon-wrapper">
            <Zap className="star-icon" size={32} />
          </div>
          <h2>Select Your Analysis Pack</h2>
          <p>Pay as you go. Credits never expire.</p>
        </div>

        <div className="pricing-grid">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`pricing-card ${pkg.highlight ? "highlight" : ""}`}
            >
              {pkg.save && (
                <div className="save-badge-corner">SAVE {pkg.save}</div>
              )}
              <h3 className="pkg-name">{pkg.name}</h3>
              <div className="pkg-credits">
                <span className="count">{pkg.credits}</span>
                <span className="label">
                  Credit{pkg.credits > 1 ? "s" : ""}
                </span>
              </div>

              <div className="price-tag">
                <span className="currency">R$</span>
                <span className="amount">{pkg.price}</span>
              </div>
              <div className="price-per-unit">
                R$ {pkg.pricePerUnit} / analysis
              </div>

              <ul className="features-list compact">
                {pkg.features.map((feat, idx) => (
                  <li key={idx}>
                    <Check size={14} /> <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`btn-upgrade ${pkg.highlight ? "primary" : "secondary"}`}
                onClick={() => handlePurchase(pkg.id)}
                disabled={!!isLoading}
              >
                {isLoading === pkg.id ? "Processing..." : "Buy Now"}
              </button>
            </div>
          ))}
        </div>

        <p className="guarantee">
          Secure payment via Stripe • Instant activation
        </p>
      </div>
    </div>,
    document.body,
  );
};
