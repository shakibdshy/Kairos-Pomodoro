import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import {
  getWeeklyData,
  getCategoryBreakdown,
  getMoodDistribution,
  getSessionNotes,
  getCompletedTasksForPeriod,
} from "@/lib/db";
import type { DatePeriod, DateRange } from "@/lib/date-range";
import { getDateRange } from "@/lib/date-range";
import { formatTotalTime, formatDuration } from "@/lib/session-utils";

const COLORS = {
  primary: [30, 64, 75] as [number, number, number],
  secondary: [71, 85, 95] as [number, number, number],
  muted: [148, 163, 184] as [number, number, number],
  accent: [45, 110, 90] as [number, number, number],
  surface: [248, 245, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

const MOOD_LABELS: Record<string, string> = {
  distracted: "Distracted",
  neutral: "Neutral",
  focused: "Focused",
};

function addHeader(doc: jsPDF, title: string, range: DateRange) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.white);
  doc.text("KAIROS - Focus Insights", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 210, 220);
  doc.text(`${title}  |  ${range.label} (${range.startDate} to ${range.endDate})`, 14, 28);

  doc.setFontSize(8);
  doc.text(`Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`, 14, 35);
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...COLORS.accent);
  doc.rect(14, y, 3, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.primary);
  doc.text(title, 20, y + 5.5);

  return y + 12;
}

function formatDurationPdf(seconds: number): string {
  if (seconds <= 0) return "0m";
  return formatTotalTime(seconds);
}

export async function exportAnalyticsPdf(period: DatePeriod): Promise<void> {
  const range = getDateRange(period);

  const [weekData, categoryBreakdown, moodStats, sessionNotes, completedTasks] =
    await Promise.all([
      getWeeklyData(range.startDate, range.endDate).catch(() => []),
      getCategoryBreakdown(range.startDate, range.endDate).catch(() => []),
      getMoodDistribution(range.startDate, range.endDate).catch(() => []),
      getSessionNotes(range.startDate, range.endDate).catch(() => []),
      getCompletedTasksForPeriod(range.startDate, range.endDate).catch(() => []),
    ]);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 28;

  addHeader(doc, "Performance Report", range);

  let y = 50;

  // --- Overview Stats ---
  const totalFocusSec = weekData.reduce((s, d) => s + d.total_seconds, 0);
  const totalSessions = weekData.reduce((s, d) => s + d.session_count, 0);
  const avgSessionSec = totalSessions > 0 ? Math.round(totalFocusSec / totalSessions) : 0;
  const avgDailySec = weekData.length > 0 ? Math.round(totalFocusSec / weekData.length) : 0;

  y = addSectionTitle(doc, "Overview", y);

  const stats = [
    { label: "Total Focus", value: formatDurationPdf(totalFocusSec) },
    { label: "Sessions", value: String(totalSessions) },
    { label: "Avg Session", value: avgSessionSec > 0 ? formatDuration(avgSessionSec) : "0m" },
    { label: "Daily Avg", value: avgDailySec > 0 ? formatDurationPdf(avgDailySec) : "0m" },
  ];

  const statBoxWidth = contentWidth / 4 - 2;
  stats.forEach((stat, i) => {
    const x = 14 + i * (statBoxWidth + 3);
    doc.setFillColor(...COLORS.surface);
    doc.roundedRect(x, y, statBoxWidth, 20, 2, 2, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text(stat.label.toUpperCase(), x + statBoxWidth / 2, y + 7, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.primary);
    doc.text(stat.value, x + statBoxWidth / 2, y + 16, { align: "center" });
  });

  y += 28;

  // --- Daily Breakdown Table ---
  if (weekData.length > 0) {
    y = addSectionTitle(doc, "Daily Breakdown", y);

    autoTable(doc, {
      startY: y,
      head: [["Day", "Date", "Focus Time", "Sessions"]],
      body: weekData.map((d) => [
        d.day_name,
        d.date,
        formatDurationPdf(d.total_seconds),
        String(d.session_count),
      ]),
      headStyles: { fillColor: COLORS.primary, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, textColor: COLORS.secondary },
      alternateRowStyles: { fillColor: [250, 248, 245] },
      margin: { left: 14, right: 14 },
      styles: { cellPadding: 2.5 },
      theme: "grid",
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // --- Category Breakdown ---
  if (categoryBreakdown.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    y = addSectionTitle(doc, "Category Breakdown", y);

    autoTable(doc, {
      startY: y,
      head: [["Category", "Focus Time", "Sessions", "Share"]],
      body: categoryBreakdown.map((c) => {
        const pct = totalFocusSec > 0 ? Math.round((c.total_seconds / totalFocusSec) * 100) : 0;
        return [
          c.category_name || c.intention || "Uncategorized",
          formatDurationPdf(c.total_seconds),
          String(c.session_count),
          `${pct}%`,
        ];
      }),
      headStyles: { fillColor: COLORS.accent, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, textColor: COLORS.secondary },
      alternateRowStyles: { fillColor: [245, 250, 248] },
      margin: { left: 14, right: 14 },
      styles: { cellPadding: 2.5 },
      theme: "grid",
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // --- Mood Distribution ---
  if (moodStats.length > 0) {
    if (y > 250) { doc.addPage(); y = 20; }
    y = addSectionTitle(doc, "Mood Distribution", y);

    const totalMoods = moodStats.reduce((s, m) => s + m.count, 0);

    autoTable(doc, {
      startY: y,
      head: [["Mood", "Sessions", "Share"]],
      body: moodStats.map((m) => {
        const pct = totalMoods > 0 ? Math.round((m.count / totalMoods) * 100) : 0;
        return [MOOD_LABELS[m.mood] ?? m.mood, String(m.count), `${pct}%`];
      }),
      headStyles: { fillColor: [180, 140, 80], fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, textColor: COLORS.secondary },
      alternateRowStyles: { fillColor: [252, 249, 244] },
      margin: { left: 14, right: 14 },
      styles: { cellPadding: 2.5 },
      theme: "grid",
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // --- Tasks Worked On ---
  if (completedTasks.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    y = addSectionTitle(doc, "Tasks Worked On", y);

    autoTable(doc, {
      startY: y,
      head: [["Task", "Category", "Focus Time", "Sessions", "Pomos"]],
      body: completedTasks.map((t) => [
        t.task_name,
        t.category_name || "-",
        formatDurationPdf(t.total_seconds),
        String(t.session_count),
        `${t.completed_pomos}/${t.estimated_pomos}`,
      ]),
      headStyles: { fillColor: COLORS.primary, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, textColor: COLORS.secondary },
      alternateRowStyles: { fillColor: [250, 248, 245] },
      margin: { left: 14, right: 14 },
      styles: { cellPadding: 2.5 },
      theme: "grid",
      columnStyles: { 0: { cellWidth: 55 } },
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // --- Session Notes ---
  if (sessionNotes.length > 0) {
    if (y > 200) { doc.addPage(); y = 20; }
    y = addSectionTitle(doc, "Session Notes", y);

    autoTable(doc, {
      startY: y,
      head: [["Date", "Category", "Task", "Mood", "Duration", "Notes"]],
      body: sessionNotes.map((n) => [
        n.started_at.split("T")[0],
        n.category_name || "-",
        n.task_name || "-",
        n.mood ? (MOOD_LABELS[n.mood] ?? n.mood) : "-",
        formatDuration(n.duration_sec),
        n.notes || "",
      ]),
      headStyles: { fillColor: COLORS.accent, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 7, textColor: COLORS.secondary },
      alternateRowStyles: { fillColor: [245, 250, 248] },
      margin: { left: 14, right: 14 },
      styles: { cellPadding: 2, overflow: "linebreak" },
      theme: "grid",
      columnStyles: { 5: { cellWidth: 55 } },
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // --- Footer on every page ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(...COLORS.muted);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text("Kairos - Focus Insights", 14, pageHeight - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: "right" });
  }

  const defaultFilename = `kairos-analytics-${range.startDate}-to-${range.endDate}.pdf`;

  const filePath = await save({
    defaultPath: defaultFilename,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
    title: "Save Analytics Report",
  });

  if (!filePath) return;

  const pdfBytes = doc.output("arraybuffer");
  await writeFile(filePath, new Uint8Array(pdfBytes));
}
