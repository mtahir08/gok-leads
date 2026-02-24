import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export interface ParseResult {
  columns: string[];
  rows: Record<string, string>[];
}

interface TextItem {
  str: string;
  x: number;
  y: number;
}

async function extractTextItems(file: File): Promise<{ items: TextItem[]; pageBreaks: number[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  const allItems: TextItem[] = [];
  const pageBreaks: number[] = [];
  let yOffset = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();

    for (const item of textContent.items) {
      if ('str' in item && typeof item.str === 'string' && item.str.trim()) {
        const tx = (item as any).transform;
        const x = tx ? tx[4] : 0;
        const y = tx ? viewport.height - tx[5] + yOffset : yOffset;
        allItems.push({ str: item.str.trim(), x: Math.round(x), y: Math.round(y) });
      }
    }
    pageBreaks.push(yOffset);
    yOffset += viewport.height + 50;
  }

  return { items: allItems, pageBreaks };
}

async function extractPlainText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    let pageText = '';
    for (const item of textContent.items) {
      if ('str' in item && typeof item.str === 'string') {
        pageText += item.str;
        if ((item as any).hasEOL) {
          pageText += '\n';
        } else {
          pageText += ' ';
        }
      }
    }
    pages.push(pageText.trim());
  }
  return pages.join('\n');
}

function groupIntoRows(items: TextItem[], tolerance = 5): TextItem[][] {
  if (items.length === 0) return [];

  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: TextItem[][] = [];
  let currentRow: TextItem[] = [sorted[0]];
  let currentY = sorted[0].y;

  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i].y - currentY) <= tolerance) {
      currentRow.push(sorted[i]);
    } else {
      rows.push(currentRow.sort((a, b) => a.x - b.x));
      currentRow = [sorted[i]];
      currentY = sorted[i].y;
    }
  }
  rows.push(currentRow.sort((a, b) => a.x - b.x));
  return rows;
}

function clusterByX(items: TextItem[], gap = 30): TextItem[][] {
  if (items.length === 0) return [];
  const sorted = [...items].sort((a, b) => a.x - b.x);
  const clusters: TextItem[][] = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].x - sorted[i - 1].x <= gap) {
      clusters[clusters.length - 1].push(sorted[i]);
    } else {
      clusters.push([sorted[i]]);
    }
  }
  return clusters;
}

function assignToColumns(row: TextItem[], colPositions: number[]): string[] {
  const cells: string[] = new Array(colPositions.length).fill('');

  for (const item of row) {
    let bestCol = 0;
    let bestDist = Math.abs(item.x - colPositions[0]);
    for (let c = 1; c < colPositions.length; c++) {
      const dist = Math.abs(item.x - colPositions[c]);
      if (dist < bestDist) {
        bestDist = dist;
        bestCol = c;
      }
    }
    cells[bestCol] = (cells[bestCol] ? cells[bestCol] + ' ' : '') + item.str;
  }

  return cells.map((c) => c.trim());
}

function parseTabular(items: TextItem[]): ParseResult | null {
  const visualLines = groupIntoRows(items);
  if (visualLines.length < 3) return null;

  let headerIdx = 0;
  let maxClusters = 0;
  for (let i = 0; i < Math.min(10, visualLines.length); i++) {
    const clusters = clusterByX(visualLines[i]);
    if (clusters.length > maxClusters) {
      maxClusters = clusters.length;
      headerIdx = i;
    }
  }

  const headerLine = visualLines[headerIdx];
  const headerClusters = clusterByX(headerLine);
  if (headerClusters.length < 2) return null;

  const colPositions = headerClusters.map((cl) => cl[0].x);
  const columns = headerClusters.map(
    (cl, i) => cl.map((item) => item.str).join(' ') || `Column ${i + 1}`,
  );

  const validHeaders = columns.filter((h) => /[a-zA-Z]/.test(h));
  if (validHeaders.length < 2) return null;

  const dataRows: Record<string, string>[] = [];
  let currentRow: Record<string, string> | null = null;
  const firstColX = colPositions[0];

  for (let i = headerIdx + 1; i < visualLines.length; i++) {
    const cells = assignToColumns(visualLines[i], colPositions);
    if (cells.every((c) => !c)) continue;

    const hasFirstCol = visualLines[i].some(
      (item) => Math.abs(item.x - firstColX) <= 30,
    );

    if (hasFirstCol) {
      if (currentRow) dataRows.push(currentRow);
      currentRow = {};
      columns.forEach((col, idx) => {
        currentRow![col] = cells[idx] || '';
      });
    } else if (currentRow) {
      columns.forEach((col, idx) => {
        if (cells[idx]) {
          currentRow![col] = currentRow![col]
            ? currentRow![col] + ' ' + cells[idx]
            : cells[idx];
        }
      });
    } else {
      currentRow = {};
      columns.forEach((col, idx) => {
        currentRow![col] = cells[idx] || '';
      });
    }
  }
  if (currentRow && Object.values(currentRow).some((v) => v)) {
    dataRows.push(currentRow);
  }

  if (dataRows.length === 0) return null;

  return { columns, rows: dataRows };
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const PHONE_PATTERNS = [
  /\+?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/g,
  /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g,
  /\+\d{1,3}\s?\d{3,4}\s?\d{3,4}\s?\d{0,4}/g,
  /\d{10,13}/g,
  /\+\d[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}/g,
];

function findPhones(text: string): string[] {
  const phones: string[] = [];
  for (const pattern of PHONE_PATTERNS) {
    const regex = new RegExp(pattern.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      const digits = m[0].replace(/\D/g, '');
      if (digits.length >= 7 && digits.length <= 15) phones.push(m[0].trim());
    }
  }
  const seen = new Set<string>();
  return phones.filter((p) => {
    const d = p.replace(/\D/g, '');
    if (seen.has(d)) return false;
    seen.add(d);
    return true;
  });
}

function parseEmailBased(rawText: string): ParseResult {
  const columns = ['Name', 'Email', 'Phone', 'Address', 'Description'];
  const fullText = rawText.replace(/\n/g, ' ');
  const allPhones = findPhones(fullText);
  const lines = rawText.split('\n');
  const rows: Record<string, string>[] = [];
  const seenEmails = new Set<string>();
  const usedPhones = new Set<string>();

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const lineEmailRegex = new RegExp(EMAIL_REGEX.source, 'g');
    let match: RegExpExecArray | null;

    while ((match = lineEmailRegex.exec(line)) !== null) {
      const email = match[0].toLowerCase();
      if (seenEmails.has(email)) continue;
      seenEmails.add(email);

      const before = line.substring(0, match.index).trim();
      const after = line.substring(match.index + match[0].length).trim();

      const nearbyLines: string[] = [];
      for (let j = Math.max(0, lineIdx - 2); j <= Math.min(lines.length - 1, lineIdx + 2); j++) {
        if (j !== lineIdx) nearbyLines.push(lines[j].trim());
      }
      const nearbyText = nearbyLines.join(' ');
      const contextText = before + ' ' + after + ' ' + nearbyText;

      let name = '';
      if (before) {
        const segments = before.split(/[,\t|]+/);
        const last = segments[segments.length - 1].trim();
        if (last && /^[a-zA-Z\s.'-]+$/.test(last)) name = last;
      }
      if (!name) {
        name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      }

      let phone = '';
      const sameLinePhones = findPhones(before + ' ' + after);
      for (const p of sameLinePhones) {
        const d = p.replace(/\D/g, '');
        if (!usedPhones.has(d)) { phone = p; usedPhones.add(d); break; }
      }
      if (!phone) {
        for (const p of findPhones(nearbyText)) {
          const d = p.replace(/\D/g, '');
          if (!usedPhones.has(d)) { phone = p; usedPhones.add(d); break; }
        }
      }
      if (!phone) {
        for (const p of allPhones) {
          const d = p.replace(/\D/g, '');
          if (!usedPhones.has(d)) { phone = p; usedPhones.add(d); break; }
        }
      }

      let address = '';
      let addrText = contextText.replace(email, '');
      if (phone) addrText = addrText.replace(phone, '');
      const addrPatterns = [
        /\d+\s+[\w\s]+(?:st|street|ave|avenue|rd|road|dr|drive|ln|lane|blvd|boulevard|ct|court|way|pl|place|circle|cir)\b[^,]*(?:,\s*[\w\s]+)*/i,
        /p\.?o\.?\s*box\s+\d+[^,]*(?:,\s*[\w\s]+)*/i,
        /[\w\s]+,\s*[\w\s]+,?\s*[\w\s]*\d{4,6}/i,
        /[\w\s]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?/,
      ];
      for (const p of addrPatterns) {
        const m2 = addrText.match(p);
        if (m2) { address = m2[0].trim().replace(/^[,\s]+|[,\s]+$/g, ''); break; }
      }

      let desc = contextText;
      [name, email, phone, address].forEach((v) => { if (v) desc = desc.replace(v, ''); });
      desc = desc.replace(/[,|;\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
      if (desc.length < 3) desc = '';

      rows.push({ Name: name.trim(), Email: email, Phone: phone, Address: address, Description: desc });
    }
  }

  return { columns, rows };
}

export async function parsePdf(file: File): Promise<ParseResult> {
  try {
    const { items } = await extractTextItems(file);
    const tabular = parseTabular(items);
    if (tabular && tabular.rows.length > 0) {
      return tabular;
    }
  } catch {
    // Fall through to email-based
  }

  const rawText = await extractPlainText(file);
  return parseEmailBased(rawText);
}
