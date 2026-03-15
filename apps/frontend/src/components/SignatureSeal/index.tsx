import React from "react";
import "./styles.css";

interface SignatureSealProps {
  status: "VERIFIED" | "CRITICAL" | "WARNING";
}

export const SignatureSeal: React.FC<SignatureSealProps> = ({ status }) => {
  const config = {
    VERIFIED: { text: "VERIFIED", color: "var(--color-success)", rotate: -15 },
    CRITICAL: { text: "HIGH RISK", color: "var(--color-danger)", rotate: 15 },
    WARNING: { text: "CAUTION", color: "var(--color-warning)", rotate: -5 },
  };

  const { text, color, rotate } = config[status];

  return (
    <div
      className="signature-seal"
      style={{
        transform: `rotate(${rotate}deg)`,
        borderColor: color,
        color: color,
      }}
    >
      <div className="seal-inner">{text}</div>
    </div>
  );
};
