import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { currency } from "@/hooks/useReportsData";

interface PdfParams {
  companyName: string;
  period: string;
  kpis: { label: string; value: string }[];
  tables?: { title: string; head: string[]; rows: string[][] }[];
}

export function exportReportPdf({ companyName, period, kpis, tables }: PdfParams) {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString("pt-BR");

  doc.setFontSize(18);
  doc.text(companyName, 14, 20);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Relatório – ${period}`, 14, 28);
  doc.text(`Emitido em ${now}`, 14, 34);

  let y = 44;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Indicadores", 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: kpis.map(k => [k.label, k.value]),
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
  });

  y = (doc as any).lastAutoTable?.finalY + 10 || y + 40;

  if (tables) {
    for (const t of tables) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.text(t.title, 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [t.head],
        body: t.rows,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 },
      });
      y = (doc as any).lastAutoTable?.finalY + 10 || y + 30;
    }
  }

  doc.save(`relatorio-${companyName.replace(/\s/g, "_")}-${now.replace(/\//g, "-")}.pdf`);
}
