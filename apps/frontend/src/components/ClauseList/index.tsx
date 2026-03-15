import React from "react";
import type { Clause } from "@legal-guardian/core";
import "./styles.css";

interface ClauseListProps {
  clauses: Clause[];
  selectedClauses: string[];
  onToggleClause: (id: string) => void;
}

export const ClauseList: React.FC<ClauseListProps> = ({
  clauses,
  selectedClauses,
  onToggleClause,
}) => {
  return (
    <div className="clause-list animate-slide-up">
      <h3 className="section-header">Riscos Identificados</h3>
      {clauses.map((clause, index) => {
        const isSelected = selectedClauses.includes(clause.id);
        const riskClass = `risk-${clause.riskLevel.toLowerCase()}`;
        const riskLabel =
          {
            CRITICAL: "CRÍTICO",
            HIGH: "ALTO",
            MEDIUM: "MÉDIO",
            LOW: "BAIXO",
          }[clause.riskLevel] || clause.riskLevel;

        return (
          <div
            key={clause.id}
            className={`clause-card ${riskClass} ${isSelected ? "selected" : ""}`}
            onClick={() => onToggleClause(clause.id)}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="clause-header">
              <span className={`risk-badge ${riskClass}-badge`}>
                {riskLabel}
              </span>
              {clause.category && (
                <span className="category-badge">{clause.category}</span>
              )}
            </div>

            <p className="clause-text">"{clause.text}"</p>

            <div className="clause-explanation">
              <strong>Análise Jurídica:</strong> {clause.explanation}
              <div className="clause-recommendation">
                <strong>Recomendação:</strong> {clause.recommendation}
              </div>
            </div>

            <div className="selection-indicator">
              {isSelected
                ? "✓ Selecionado para Negociação"
                : "+ Adicionar à Negociação"}
            </div>
          </div>
        );
      })}
    </div>
  );
};
