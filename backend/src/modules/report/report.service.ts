import { getSummary } from '../summary/summary.service.js';
import { listBudgets, PublicBudget } from '../budget/budget.service.js';
import { listGoals } from '../goal/goal.service.js';
import { getProfile } from '../profile/profile.service.js';
import { getHealthScore, PublicHealthScore } from '../score/score.service.js';
import { getLatestPrediction, PublicPrediction } from '../prediction/prediction.service.js';
import { AppError } from '../../utils/AppError.js';
import { isDatabaseConnected } from '../../config/db.js';

export type PublicReport = {
  preparedFor: string;
  period: { key: string; label: string };
  currentMonth: {
    income: number;
    expense: number;
    savings: number;
    savingsRate: number;
    byCategory: { category: string; amount: number }[];
  };
  prediction: PublicPrediction | null;
  health: PublicHealthScore | null;
  budgets: PublicBudget[];
  goals: {
    name: string;
    remaining: number;
    requiredMonthly: number;
    status: string;
  }[];
  executiveSummary: string;
};

function assertDatabase() {
  if (!isDatabaseConnected()) {
    throw new AppError('Database is not connected. Try again in a moment.', 503);
  }
}

function formatRs(amount: number) {
  return `Rs. ${Math.round(amount).toLocaleString('en-US')}`;
}

function ascii(text: string) {
  return text.replace(/[^\x20-\x7E]/g, '?');
}

function wrapLine(text: string, width: number) {
  if (text.length <= width) return [text];
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= width) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
  }
  if (current) lines.push(current);
  return lines;
}

function buildExecutiveSummary(report: Omit<PublicReport, 'executiveSummary'>): string {
  const parts: string[] = [];
  const { currentMonth, budgets, health, goals, period } = report;
  parts.push(
    `In ${period.label}, income was ${formatRs(currentMonth.income)}, expenses ${formatRs(currentMonth.expense)}, and net savings ${formatRs(currentMonth.savings)} (${currentMonth.savingsRate}%).`
  );

  const over = budgets.filter((item) => item.utilization > 100);
  if (over.length > 0) {
    parts.push(
      `Over-budget: ${over
        .map((item) => `${item.category || 'Overall'} at ${item.utilization}%`)
        .join(', ')}.`
    );
  } else if (budgets.length > 0) {
    parts.push('All recorded budgets for this month are within 100% utilization.');
  }

  if (health) {
    parts.push(`Health score is ${health.overallScore}/100 (${health.status}).`);
    if (health.recommendations[0]) parts.push(health.recommendations[0]);
  }

  const activeGoal = goals.find((item) => item.status === 'ACTIVE');
  if (activeGoal) {
    parts.push(
      `Active goal "${activeGoal.name}" still needs ${formatRs(activeGoal.remaining)} (${formatRs(activeGoal.requiredMonthly)} / month).`
    );
  }

  return parts.join(' ');
}

export async function buildReport(userId: string): Promise<PublicReport> {
  assertDatabase();
  const [profile, summary, budgetResult, goalResult, prediction, health] = await Promise.all([
    getProfile(userId),
    getSummary(userId, 6),
    listBudgets(userId, {}),
    listGoals(userId),
    getLatestPrediction(userId),
    getHealthScore(userId),
  ]);

  const draft = {
    preparedFor: profile.name,
    period: { key: summary.currentMonth.key, label: summary.currentMonth.label },
    currentMonth: {
      income: summary.currentMonth.income,
      expense: summary.currentMonth.expense,
      savings: summary.currentMonth.savings,
      savingsRate: summary.currentMonth.savingsRate,
      byCategory: summary.currentMonth.byCategory,
    },
    prediction,
    health,
    budgets: budgetResult.budgets,
    goals: goalResult.goals.map((goal) => ({
      name: goal.name,
      remaining: goal.remaining,
      requiredMonthly: goal.requiredMonthly,
      status: goal.status,
    })),
  };

  return {
    ...draft,
    executiveSummary: buildExecutiveSummary(draft),
  };
}

function reportLines(report: PublicReport): string[] {
  const year = report.period.key.slice(0, 4);
  const lines = [
    `Prepared for: ${report.preparedFor}`,
    `Period: ${report.period.label} ${year}`,
    '',
    'Totals',
    `Income: ${formatRs(report.currentMonth.income)}`,
    `Expenses: ${formatRs(report.currentMonth.expense)}`,
    `Savings: ${formatRs(report.currentMonth.savings)} (${report.currentMonth.savingsRate}%)`,
    '',
    'Spending by category',
  ];

  if (report.currentMonth.byCategory.length === 0) {
    lines.push('No expenses recorded this month.');
  } else {
    for (const row of report.currentMonth.byCategory) {
      lines.push(`${row.category}: ${formatRs(row.amount)}`);
    }
  }

  lines.push('', 'Budgets');
  if (report.budgets.length === 0) {
    lines.push('No budgets set for this month.');
  } else {
    for (const budget of report.budgets) {
      lines.push(
        `${budget.category || 'Overall'}: ${formatRs(budget.spent)} of ${formatRs(budget.amount)} (${budget.utilization}%)`
      );
    }
  }

  lines.push('', 'Forecast');
  if (!report.prediction) {
    lines.push('No stored forecast. Train a model on the Predictions page.');
  } else {
    lines.push(
      `${report.prediction.predictionPeriod}: ${formatRs(report.prediction.predictedAmount)} using ${report.prediction.modelUsed}`
    );
  }

  lines.push('', 'Health score');
  if (!report.health) {
    lines.push('Health score is not available.');
  } else {
    lines.push(`${report.health.overallScore}/100 (${report.health.status})`);
  }

  lines.push('', 'Executive summary');
  lines.push(report.executiveSummary);
  return lines;
}

function pdfEscape(text: string) {
  return ascii(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function buildPdfBuffer(report: PublicReport): Buffer {
  const title = 'SmartFin AI Monthly Statement';
  const rawLines = [title, '', ...reportLines(report)].flatMap((line) => wrapLine(line, 88));

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const fontSize = 11;
  const lineHeight = 14;
  const maxLines = Math.floor((pageHeight - margin * 2) / lineHeight);

  const pages: string[][] = [];
  let current: string[] = [];
  for (const line of rawLines) {
    if (current.length >= maxLines) {
      pages.push(current);
      current = [];
    }
    current.push(line);
  }
  if (current.length) pages.push(current);

  const objects: string[] = [];
  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n');
  const kids = pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ');
  objects.push(`2 0 obj << /Type /Pages /Kids [${kids}] /Count ${pages.length} >> endobj\n`);
  const fontObjNum = 3 + pages.length * 2;

  pages.forEach((pageLines, index) => {
    const pageObj = 3 + index * 2;
    const contentObj = 4 + index * 2;
    objects.push(
      `${pageObj} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObj} 0 R /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> >> endobj\n`
    );
    let stream = `BT /F1 ${fontSize} Tf ${margin} ${pageHeight - margin} Td ${lineHeight} TL\n`;
    pageLines.forEach((line, lineIndex) => {
      const escaped = pdfEscape(line || ' ');
      stream += lineIndex === 0 ? `(${escaped}) Tj\n` : `(${escaped}) '\n`;
    });
    stream += 'ET';
    objects.push(
      `${contentObj} 0 obj << /Length ${Buffer.byteLength(stream, 'latin1')} >> stream\n${stream}\nendstream endobj\n`
    );
  });

  objects.push(`${fontObjNum} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += object;
  }
  const xrefPos = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${offsets.length}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return Buffer.from(pdf, 'latin1');
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function excelRow(cells: { type: 'String' | 'Number'; value: string | number }[]) {
  const inner = cells
    .map((cell) => {
      if (cell.type === 'Number') {
        return `<Cell><Data ss:Type="Number">${cell.value}</Data></Cell>`;
      }
      return `<Cell><Data ss:Type="String">${xmlEscape(String(cell.value))}</Data></Cell>`;
    })
    .join('');
  return `<Row>${inner}</Row>`;
}

export function buildExcelBuffer(report: PublicReport): Buffer {
  const year = report.period.key.slice(0, 4);
  const rows: string[] = [
    excelRow([{ type: 'String', value: 'SmartFin AI Monthly Statement' }]),
    excelRow([
      { type: 'String', value: 'Prepared for' },
      { type: 'String', value: report.preparedFor },
    ]),
    excelRow([
      { type: 'String', value: 'Period' },
      { type: 'String', value: `${report.period.label} ${year}` },
    ]),
    excelRow([]),
    excelRow([
      { type: 'String', value: 'Income' },
      { type: 'Number', value: report.currentMonth.income },
    ]),
    excelRow([
      { type: 'String', value: 'Expenses' },
      { type: 'Number', value: report.currentMonth.expense },
    ]),
    excelRow([
      { type: 'String', value: 'Savings' },
      { type: 'Number', value: report.currentMonth.savings },
    ]),
    excelRow([
      { type: 'String', value: 'Savings rate %' },
      { type: 'Number', value: report.currentMonth.savingsRate },
    ]),
    excelRow([]),
    excelRow([{ type: 'String', value: 'Category' }, { type: 'String', value: 'Amount' }]),
  ];

  if (report.currentMonth.byCategory.length === 0) {
    rows.push(excelRow([{ type: 'String', value: 'No expenses recorded this month.' }]));
  } else {
    for (const row of report.currentMonth.byCategory) {
      rows.push(
        excelRow([
          { type: 'String', value: row.category },
          { type: 'Number', value: row.amount },
        ])
      );
    }
  }

  rows.push(excelRow([]));
  rows.push(excelRow([{ type: 'String', value: 'Budget' }, { type: 'String', value: 'Spent' }, { type: 'String', value: 'Limit' }, { type: 'String', value: 'Utilization %' }]));
  if (report.budgets.length === 0) {
    rows.push(excelRow([{ type: 'String', value: 'No budgets set for this month.' }]));
  } else {
    for (const budget of report.budgets) {
      rows.push(
        excelRow([
          { type: 'String', value: budget.category || 'Overall' },
          { type: 'Number', value: budget.spent },
          { type: 'Number', value: budget.amount },
          { type: 'Number', value: budget.utilization },
        ])
      );
    }
  }

  rows.push(excelRow([]));
  if (report.prediction) {
    rows.push(
      excelRow([
        { type: 'String', value: 'Forecast period' },
        { type: 'String', value: report.prediction.predictionPeriod },
      ])
    );
    rows.push(
      excelRow([
        { type: 'String', value: 'Forecast amount' },
        { type: 'Number', value: report.prediction.predictedAmount },
      ])
    );
    rows.push(
      excelRow([
        { type: 'String', value: 'Model' },
        { type: 'String', value: report.prediction.modelUsed },
      ])
    );
  } else {
    rows.push(excelRow([{ type: 'String', value: 'No stored forecast.' }]));
  }

  if (report.health) {
    rows.push(
      excelRow([
        { type: 'String', value: 'Health score' },
        { type: 'Number', value: report.health.overallScore },
      ])
    );
    rows.push(
      excelRow([
        { type: 'String', value: 'Health status' },
        { type: 'String', value: report.health.status },
      ])
    );
  }

  rows.push(excelRow([]));
  rows.push(
    excelRow([
      { type: 'String', value: 'Executive summary' },
      { type: 'String', value: report.executiveSummary },
    ])
  );

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Statement">
  <Table>
   ${rows.join('\n   ')}
  </Table>
 </Worksheet>
</Workbook>`;

  return Buffer.from(xml, 'utf8');
}

export function exportFilename(report: PublicReport, extension: 'pdf' | 'xls') {
  return `smartfin-statement-${report.period.key}.${extension}`;
}
