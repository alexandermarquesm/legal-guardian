import React, { useState } from "react";
import "./styles.css";

interface NegotiationPanelProps {
  isLoading: boolean;
  emailBody: string | null;
  onGenerate: () => void;
  selectedCount: number;
}

export const NegotiationPanel: React.FC<NegotiationPanelProps> = ({
  isLoading,
  emailBody,
  onGenerate,
  selectedCount,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (emailBody) {
      navigator.clipboard.writeText(emailBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContainerClick = () => {
    // If text is selected, do NOT trigger auto-copy
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    // Only copy if not already in "copied" state to prevent spam
    if (!copied) {
      handleCopy();
    }
  };

  return (
    <div className="negotiation-panel card">
      <div className="panel-header">
        <h3 className="panel-title">Negociação</h3>
        <button
          className="btn btn-accent"
          onClick={onGenerate}
          disabled={isLoading || selectedCount === 0}
        >
          {isLoading
            ? "Escrevendo..."
            : selectedCount > 0
              ? `Gerar E-mail (${selectedCount})`
              : "Selecione Riscos"}
        </button>
      </div>

      <div className="panel-content">
        {emailBody ? (
          <div
            className={`email-preview ${copied ? "copied" : ""}`}
            onClick={handleContainerClick}
            title="Clique para copiar (ou selecione texto)"
          >
            {copied && (
              <div className="copy-feedback">
                <span className="copy-icon">✓</span>
                <span>Copiado para área de transferência</span>
              </div>
            )}

            <pre className="email-body">{emailBody}</pre>
          </div>
        ) : (
          <div className="empty-state">
            <span className="icon">✉️</span>
            <p>
              Selecione cláusulas de risco e clique em "Gerar E-mail" para criar
              um rascunho de negociação.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
