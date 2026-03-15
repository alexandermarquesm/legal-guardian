import { DocumentAnalysis, Clause, RiskLevel } from "@legal-guardian/core";

export const MOCK_DOCUMENT_ANALYSIS: DocumentAnalysis = {
  id: "mock-doc-real-analysis",
  documentName: "Contrato de Prestação de Serviços.pdf",
  overallRiskScore: 10,
  createdAt: new Date(),
  status: "COMPLETED",
  summary:
    "O contrato de locação de imóvel residencial é bem estruturado e cobre os principais aspectos legais necessários. A maioria das cláusulas são padrão e apresentam baixo risco. Há uma pequena ressalva na cláusula de multa por atraso, que poderia ser revisada para garantir conformidade com a legislação local.",
  clauses: [
    {
      id: "clause-1",
      text: "CLÁUSULA 1ª – DO IMÓVEL\nO LOCADOR dá em locação ao LOCATÁRIO o imóvel residencial situado à Rua Exemplo, nº 123, Bairro Centro, Cidade/UF.",
      riskLevel: "LOW" as RiskLevel,
      category: "Identificação do Imóvel",
      explanation:
        "A cláusula identifica claramente o imóvel objeto do contrato.",
      recommendation: "Nenhuma alteração necessária.",
      riskScore: 0,
    },
    {
      id: "clause-2",
      text: "CLÁUSULA 2ª – DO PRAZO\nO prazo da locação é de 24 (vinte e quatro) meses, iniciando-se em 01/01/2026 e encerrando-se em 31/12/2027.",
      riskLevel: "LOW" as RiskLevel,
      category: "Prazo",
      explanation:
        "O prazo está claramente definido e dentro do padrão para contratos de locação.",
      recommendation: "Nenhuma alteração necessária.",
      riskScore: 0,
    },
    {
      id: "clause-3",
      text: "CLÁUSULA 3ª – DO VALOR DO ALUGUEL\nO aluguel mensal será de R$ 2.500,00 (dois mil e quinhentos reais), com vencimento todo dia 05 de cada mês.",
      riskLevel: "LOW" as RiskLevel,
      category: "Financeiro",
      explanation:
        "O valor do aluguel e a data de vencimento estão claramente especificados.",
      recommendation: "Nenhuma alteração necessária.",
      riskScore: 0,
    },
    {
      id: "clause-4",
      text: "CLÁUSULA 4ª – DO REAJUSTE\nO valor do aluguel será reajustado anualmente pelo índice IPCA.",
      riskLevel: "LOW" as RiskLevel,
      category: "Financeiro",
      explanation:
        "O reajuste anual pelo índice IPCA é uma prática comum e transparente.",
      recommendation: "Nenhuma alteração necessária.",
      riskScore: 0,
    },
    {
      id: "clause-5",
      text: "CLÁUSULA 5ª – DOS ENCARGOS\nFicam a cargo do LOCATÁRIO as despesas de água, energia elétrica, IPTU e demais encargos.",
      riskLevel: "LOW" as RiskLevel,
      category: "Obrigações do Locatário",
      explanation:
        "A cláusula define claramente as responsabilidades do locatário quanto aos encargos.",
      recommendation: "Nenhuma alteração necessária.",
      riskScore: 0,
    },
    {
      id: "clause-6",
      text: "CLÁUSULA 6ª – DA GARANTIA\nA garantia da presente locação será realizada por meio de caução equivalente a 3 (três) meses de aluguel.",
      riskLevel: "LOW" as RiskLevel,
      category: "Garantia",
      explanation:
        "A caução de três meses é uma prática comum e está dentro dos limites legais.",
      recommendation: "Nenhuma alteração necessária.",
      riskScore: 0,
    },
    {
      id: "clause-7",
      text: "CLÁUSULA 7ª – DA MULTA\nEm caso de atraso no pagamento, incidirá multa de 10% sobre o valor devido, além de juros de 1% ao mês.",
      riskLevel: "MEDIUM" as RiskLevel,
      category: "Financeiro",
      explanation:
        "A multa de 10% pode ser considerada alta dependendo da legislação local, que pode limitar a multa a 2% em alguns casos.",
      recommendation:
        "Revisar a conformidade da multa com a legislação local para evitar possíveis disputas legais.",
      riskScore: 10,
    },
    {
      id: "clause-8",
      text: "CLÁUSULA 8ª – DA RESCISÃO\nA rescisão antecipada implicará multa proporcional ao tempo restante do contrato.",
      riskLevel: "LOW" as RiskLevel,
      category: "Rescisão",
      explanation:
        "A cláusula de rescisão proporcional é justa e protege ambas as partes.",
      recommendation: "Nenhuma alteração necessária.",
      riskScore: 0,
    },
    {
      id: "clause-9",
      text: "CLÁUSULA 9ª – DO FORO\nFica eleito o foro da comarca de Cidade/UF para dirimir quaisquer dúvidas.",
      riskLevel: "LOW" as RiskLevel,
      category: "Jurídico",
      explanation:
        "A escolha do foro é comum e não apresenta riscos significativos.",
      recommendation: "Nenhuma alteração necessária.",
      riskScore: 0,
    },
  ],
};
