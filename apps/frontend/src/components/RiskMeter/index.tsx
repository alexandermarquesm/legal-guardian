import React from "react";
import "./styles.css";

interface RiskMeterProps {
  score: number;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score }) => {
  // Calculate color based on score (Green -> Yellow -> Red)
  const getRiskColor = (s: number) => {
    // 120 (Green) to 0 (Red)
    const hue = Math.max(0, 120 - s * 1.2);
    return `hsl(${hue}, 100%, 45%)`;
  };

  const riskColor = getRiskColor(score);
  const rotation = (score / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="risk-meter-container card animate-fade-in">
      <h3 className="section-title">Avaliação de Risco</h3>

      <div className="gauge-wrapper">
        <div className="gauge-body"></div>
        <div
          className="gauge-needle-wrapper"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="gauge-needle"></div>
        </div>
        <div className="gauge-cover">
          <span className="score" style={{ color: riskColor }}>
            {score}
          </span>
          <span className="label">Pontos</span>
        </div>
      </div>

      <div
        className="risk-label"
        style={{ color: riskColor, borderColor: riskColor }}
      >
        {score < 30
          ? "Baixo Risco"
          : score < 70
            ? "Atenção Necessária"
            : "Alto Risco"}
      </div>
    </div>
  );
};
