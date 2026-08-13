import PDFDocument from 'pdfkit';
import { marked, type Token, type Tokens } from 'marked';

export interface MarkdownPdfOptions {
  title: string;
  reportId?: string;
  author?: string;
  subtitle?: string;
}

const COLORS = {
  brand: '#1e3a5f',
  accent: '#2563eb',
  accentSoft: '#eff6ff',
  muted: '#64748b',
  rule: '#e2e8f0',
  text: '#0f172a',
  softText: '#334155',
  white: '#ffffff',
  page: '#ffffff',
  quoteBar: '#93c5fd',
  codeBg: '#f1f5f9',
};

const PAGE = {
  bottom: 760,
  footerY: 772,
  marginX: 48,
  marginTop: 48,
  contentWidth: 499,
};

type InlineRun = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  link?: boolean;
};

export function renderMarkdownToPdf(
  markdown: string,
  options: MarkdownPdfOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: PAGE.marginX,
      size: 'A4',
      bufferPages: true,
      info: {
        Title: options.title,
        Author: options.author ?? 'Zehnify Clinical System',
      },
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const renderer = new MarkdownPdfRenderer(doc);
    renderer.renderHeader(options);
    renderer.renderMarkdown(sanitizeMarkdown(markdown));
    renderer.renderFooters();

    doc.end();
  });
}

function sanitizeMarkdown(markdown: string): string {
  const now = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return markdown
    .replace(/\[Current Date\]/gi, now)
    .replace(/\[Date\]/gi, now)
    .replace(/\[Today'?s? Date\]/gi, now)
    .replace(/\r\n/g, '\n')
    // Split packed label lines so each **Label:** becomes its own paragraph
    .replace(/([^\n])\n(\*\*[^*\n]+?:\*\*)/g, '$1\n\n$2')
    .replace(/(\*\*[^*\n]+?:\*\*[^\n]*)\n(\*\*[^*\n]+?:\*\*)/g, '$1\n\n$2')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

class MarkdownPdfRenderer {
  private listDepth = 0;

  constructor(private readonly doc: InstanceType<typeof PDFDocument>) {}

  renderHeader(options: MarkdownPdfOptions) {
    const { doc } = this;
    const bandHeight = 56;

    doc.save();
    doc.rect(0, 0, doc.page.width, bandHeight).fill(COLORS.brand);
    doc
      .fillColor(COLORS.white)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('ZEHNIFY', PAGE.marginX, 18, {
        width: PAGE.contentWidth,
        lineBreak: false,
      });
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#bfdbfe')
      .text('Clinical Documentation', PAGE.marginX, 34, {
        width: PAGE.contentWidth,
        lineBreak: false,
      });
    doc.restore();

    doc.y = bandHeight + 24;

    doc
      .fillColor(COLORS.brand)
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(options.title, PAGE.marginX, doc.y, {
        width: PAGE.contentWidth,
        align: 'left',
        lineGap: 2,
      });

    if (options.subtitle) {
      doc.moveDown(0.25);
      doc
        .fillColor(COLORS.accent)
        .font('Helvetica')
        .fontSize(10)
        .text(options.subtitle, {
          width: PAGE.contentWidth,
        });
    }

    doc.moveDown(0.55);

    const metaY = doc.y;
    const reportId =
      options.reportId ?? Math.random().toString(36).slice(2, 11).toUpperCase();
    const generatedAt = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    doc
      .roundedRect(PAGE.marginX, metaY, PAGE.contentWidth, 36, 6)
      .fill(COLORS.accentSoft);

    doc
      .fillColor(COLORS.softText)
      .font('Helvetica')
      .fontSize(8)
      .text(`Report ID  ${reportId}`, PAGE.marginX + 12, metaY + 10, {
        width: PAGE.contentWidth - 24,
        lineBreak: false,
      })
      .text(`Generated  ${generatedAt}`, PAGE.marginX + 12, metaY + 22, {
        width: PAGE.contentWidth - 24,
        lineBreak: false,
      });

    doc.y = metaY + 48;
    doc.x = PAGE.marginX;
  }

  renderMarkdown(markdown: string) {
    const tokens = marked.lexer(markdown);
    for (const token of tokens) {
      this.renderBlock(token);
    }
  }

  renderFooters() {
    const range = this.doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      this.doc.switchToPage(i);

      this.doc
        .strokeColor(COLORS.rule)
        .lineWidth(0.6)
        .moveTo(PAGE.marginX, PAGE.bottom)
        .lineTo(PAGE.marginX + PAGE.contentWidth, PAGE.bottom)
        .stroke();

      this.doc
        .fontSize(7.5)
        .fillColor(COLORS.muted)
        .font('Helvetica')
        .text(
          'AI-assisted clinical summary — review and validate with a licensed clinician before clinical use.',
          PAGE.marginX,
          PAGE.footerY,
          { width: PAGE.contentWidth * 0.72, align: 'left', lineBreak: false },
        )
        .text(`Page ${i - range.start + 1} of ${range.count}`, PAGE.marginX, PAGE.footerY, {
          width: PAGE.contentWidth,
          align: 'right',
          lineBreak: false,
        });
    }
  }

  private ensureSpace(minHeight = 40) {
    if (this.doc.y + minHeight > PAGE.bottom) {
      this.doc.addPage();
      this.doc.x = PAGE.marginX;
      this.doc.y = PAGE.marginTop;
    }
  }

  private renderBlock(token: Token) {
    switch (token.type) {
      case 'heading':
        this.renderHeading(token as Tokens.Heading);
        break;
      case 'paragraph':
        this.renderParagraph(token as Tokens.Paragraph);
        break;
      case 'list':
        this.renderList(token as Tokens.List);
        break;
      case 'blockquote':
        this.renderBlockquote(token as Tokens.Blockquote);
        break;
      case 'hr':
        this.renderHorizontalRule();
        break;
      case 'code':
        this.renderCodeBlock(token as Tokens.Code);
        break;
      case 'space':
        this.doc.moveDown(0.35);
        break;
      case 'table':
        this.renderTable(token as Tokens.Table);
        break;
      default:
        if ('text' in token && typeof token.text === 'string' && token.text.trim()) {
          this.renderPlainParagraph(token.text);
        }
        break;
    }
  }

  private renderHeading(token: Tokens.Heading) {
    this.ensureSpace(42);
    const depth = token.depth;
    const sizes: Record<number, number> = {
      1: 15,
      2: 12.5,
      3: 11.5,
      4: 11,
      5: 10.5,
      6: 10.5,
    };

    this.doc.moveDown(depth === 1 ? 0.45 : 0.55);

    const headingText =
      depth <= 2 ? token.text.trim().toUpperCase() : token.text.trim();

    if (depth === 1) {
      const y = this.doc.y;
      this.doc
        .roundedRect(PAGE.marginX, y, PAGE.contentWidth, 26, 4)
        .fill(COLORS.accentSoft);
      this.doc
        .fillColor(COLORS.brand)
        .font('Helvetica-Bold')
        .fontSize(sizes[1])
        .text(headingText, PAGE.marginX + 10, y + 7, {
          width: PAGE.contentWidth - 20,
          lineBreak: false,
        });
      this.doc.y = y + 34;
      this.doc.x = PAGE.marginX;
      return;
    }

    this.doc
      .fillColor(depth === 2 ? COLORS.accent : COLORS.brand)
      .font('Helvetica-Bold')
      .fontSize(sizes[depth] ?? 11)
      .text(headingText, PAGE.marginX, this.doc.y, {
        width: PAGE.contentWidth,
        lineGap: 1,
      });

    if (depth === 2) {
      const lineY = this.doc.y + 3;
      this.doc
        .strokeColor(COLORS.rule)
        .lineWidth(0.8)
        .moveTo(PAGE.marginX, lineY)
        .lineTo(PAGE.marginX + PAGE.contentWidth, lineY)
        .stroke();
      this.doc
        .strokeColor(COLORS.accent)
        .lineWidth(2)
        .moveTo(PAGE.marginX, lineY)
        .lineTo(PAGE.marginX + 48, lineY)
        .stroke();
      this.doc.y = lineY + 12;
    } else {
      this.doc.moveDown(0.2);
    }

    this.doc.x = PAGE.marginX;
  }

  private renderParagraph(token: Tokens.Paragraph) {
    this.ensureSpace(28);
    const indent = this.listDepth > 0 ? this.listDepth * 14 : 0;
    const x = PAGE.marginX + indent;
    const width = PAGE.contentWidth - indent;
    const runs = this.flattenInline(token.tokens ?? []);
    this.writeRuns(runs, x, this.doc.y, width, 3);
    this.doc.x = PAGE.marginX;
    this.doc.moveDown(0.4);
  }

  private renderPlainParagraph(text: string) {
    this.ensureSpace(24);
    this.doc
      .fillColor(COLORS.text)
      .font('Helvetica')
      .fontSize(10.5)
      .text(text, PAGE.marginX, this.doc.y, {
        width: PAGE.contentWidth,
        align: 'left',
        lineGap: 3,
      });
    this.doc.x = PAGE.marginX;
    this.doc.moveDown(0.35);
  }

  private renderList(token: Tokens.List) {
    this.listDepth += 1;
    const depthOffset = (this.listDepth - 1) * 16;
    const startX = PAGE.marginX + depthOffset;
    const markerWidth = token.ordered ? 18 : 12;
    const textX = startX + markerWidth + 4;
    const textWidth = PAGE.contentWidth - depthOffset - markerWidth - 4;

    token.items.forEach((item, index) => {
      this.ensureSpace(22);
      const rowY = this.doc.y;
      const startNum = Number(token.start ?? 1);

      if (token.ordered) {
        this.doc
          .fillColor(COLORS.accent)
          .font('Helvetica-Bold')
          .fontSize(10.5)
          .text(`${startNum + index}.`, startX, rowY, {
            width: markerWidth,
            lineBreak: false,
            continued: false,
          });
      } else {
        this.doc
          .circle(startX + 3.2, rowY + 5.2, 1.7)
          .fill(COLORS.accent);
      }

      this.doc.y = rowY;
      this.doc.x = textX;

      const children = item.tokens ?? [];
      if (children.length === 0 && item.text) {
        this.doc
          .fillColor(COLORS.text)
          .font('Helvetica')
          .fontSize(10.5)
          .text(item.text, textX, rowY, {
            width: textWidth,
            align: 'left',
            lineGap: 2,
          });
      } else {
        let wroteText = false;
        for (const child of children) {
          if (child.type === 'paragraph' || child.type === 'text') {
            const paragraph = child as Tokens.Paragraph;
            const runs = this.flattenInline(
              paragraph.tokens ?? [
                { type: 'text', raw: paragraph.text, text: paragraph.text } as Token,
              ],
            );
            const y = wroteText ? this.doc.y : rowY;
            this.writeRuns(runs, textX, y, textWidth, 2);
            wroteText = true;
          } else if (child.type === 'list') {
            this.doc.moveDown(0.12);
            this.renderList(child as Tokens.List);
          } else {
            this.renderBlock(child);
          }
        }
      }

      this.doc.x = PAGE.marginX;
      this.doc.moveDown(0.22);
    });

    this.listDepth -= 1;
    if (this.listDepth === 0) {
      this.doc.moveDown(0.2);
    }
  }

  private renderBlockquote(token: Tokens.Blockquote) {
    this.ensureSpace(36);
    const startY = this.doc.y;
    const quoteX = PAGE.marginX + 14;

    this.doc.x = quoteX;
    for (const child of token.tokens) {
      if (child.type === 'paragraph') {
        const runs = this.flattenInline((child as Tokens.Paragraph).tokens ?? []);
        this.writeRuns(runs, quoteX, this.doc.y, PAGE.contentWidth - 14, 3, {
          italicDefault: true,
          color: COLORS.softText,
        });
        this.doc.moveDown(0.25);
      } else {
        this.renderBlock(child);
      }
    }

    const endY = Math.max(this.doc.y, startY + 12);
    this.doc
      .strokeColor(COLORS.quoteBar)
      .lineWidth(2.5)
      .moveTo(PAGE.marginX + 2, startY)
      .lineTo(PAGE.marginX + 2, endY)
      .stroke();

    this.doc.x = PAGE.marginX;
    this.doc.y = endY;
    this.doc.moveDown(0.35);
  }

  private renderHorizontalRule() {
    this.ensureSpace(18);
    this.doc.moveDown(0.35);
    this.doc
      .strokeColor(COLORS.rule)
      .lineWidth(1)
      .moveTo(PAGE.marginX, this.doc.y)
      .lineTo(PAGE.marginX + PAGE.contentWidth, this.doc.y)
      .stroke();
    this.doc.moveDown(0.45);
  }

  private renderCodeBlock(token: Tokens.Code) {
    this.ensureSpace(48);
    this.doc.moveDown(0.25);
    const startY = this.doc.y;
    const text = token.text.replace(/\s+$/g, '');

    this.doc
      .fillColor(COLORS.text)
      .font('Courier')
      .fontSize(8.5);

    const measured = this.doc.heightOfString(text, {
      width: PAGE.contentWidth - 20,
      lineGap: 1,
    });

    this.doc
      .roundedRect(PAGE.marginX, startY, PAGE.contentWidth, measured + 16, 4)
      .fill(COLORS.codeBg);

    this.doc
      .fillColor('#1e293b')
      .font('Courier')
      .fontSize(8.5)
      .text(text, PAGE.marginX + 10, startY + 8, {
        width: PAGE.contentWidth - 20,
        lineGap: 1,
      });

    this.doc.x = PAGE.marginX;
    this.doc.moveDown(0.4);
  }

  private renderTable(token: Tokens.Table) {
    this.ensureSpace(40);
    this.doc.moveDown(0.25);

    const cols = Math.max(token.header.length, 1);
    const colWidth = PAGE.contentWidth / cols;
    let y = this.doc.y;

    this.doc
      .roundedRect(PAGE.marginX, y, PAGE.contentWidth, 18, 3)
      .fill(COLORS.accentSoft);

    this.doc.fillColor(COLORS.brand).font('Helvetica-Bold').fontSize(9);
    token.header.forEach((cell, i) => {
      this.doc.text(this.extractText(cell), PAGE.marginX + i * colWidth + 4, y + 5, {
        width: colWidth - 8,
        lineBreak: false,
      });
    });
    y += 22;

    this.doc.font('Helvetica').fontSize(9).fillColor(COLORS.text);
    for (const row of token.rows) {
      this.ensureSpace(20);
      if (this.doc.y > y) y = this.doc.y;
      let rowHeight = 16;
      row.forEach((cell, i) => {
        const cellText = this.extractText(cell);
        const h = this.doc.heightOfString(cellText, { width: colWidth - 8 });
        rowHeight = Math.max(rowHeight, h + 6);
        this.doc.text(cellText, PAGE.marginX + i * colWidth + 4, y + 3, {
          width: colWidth - 8,
        });
      });
      y += rowHeight;
      this.doc.y = y;
    }

    this.doc.x = PAGE.marginX;
    this.doc.moveDown(0.35);
  }

  private extractText(cell: Tokens.TableCell): string {
    if (typeof cell === 'string') return cell;
    if ('text' in cell) return cell.text;
    return '';
  }

  private flattenInline(tokens: Token[], style: Partial<InlineRun> = {}): InlineRun[] {
    const runs: InlineRun[] = [];

    for (const token of tokens) {
      switch (token.type) {
        case 'text':
          runs.push({
            text: this.normalizeInlineText(token.text),
            bold: style.bold,
            italic: style.italic,
            code: style.code,
            link: style.link,
          });
          break;
        case 'strong':
          runs.push(
            ...this.flattenInline(token.tokens ?? [{ type: 'text', text: token.text, raw: token.text } as Token], {
              ...style,
              bold: true,
            }),
          );
          break;
        case 'em':
          runs.push(
            ...this.flattenInline(token.tokens ?? [{ type: 'text', text: token.text, raw: token.text } as Token], {
              ...style,
              italic: true,
            }),
          );
          break;
        case 'codespan':
          runs.push({ text: token.text, code: true });
          break;
        case 'link':
          runs.push(
            ...this.flattenInline(
              token.tokens ?? [{ type: 'text', text: token.text, raw: token.text } as Token],
              { ...style, link: true },
            ),
          );
          break;
        case 'br':
          runs.push({ text: '\n' });
          break;
        case 'escape':
          runs.push({ text: token.text, ...style });
          break;
        default:
          if ('text' in token && typeof token.text === 'string' && token.text) {
            runs.push({ text: this.normalizeInlineText(token.text), ...style });
          }
          break;
      }
    }

    return runs.filter((r) => r.text.length > 0);
  }

  private normalizeInlineText(text: string): string {
    return text.replace(/\s*\n\s*/g, ' ');
  }

  private applyRunStyle(
    run: InlineRun,
    opts?: { italicDefault?: boolean; color?: string },
  ) {
    const color = opts?.color ?? COLORS.text;
    if (run.code) {
      this.doc.font('Courier').fontSize(9.5).fillColor('#1e293b');
      return;
    }
    const bold = run.bold;
    const italic = run.italic || opts?.italicDefault;
    if (bold && italic) this.doc.font('Helvetica-BoldOblique');
    else if (bold) this.doc.font('Helvetica-Bold');
    else if (italic) this.doc.font('Helvetica-Oblique');
    else this.doc.font('Helvetica');
    this.doc.fontSize(10.5).fillColor(run.link ? COLORS.accent : color);
  }

  private writeRuns(
    runs: InlineRun[],
    x: number,
    y: number,
    width: number,
    lineGap: number,
    opts?: { italicDefault?: boolean; color?: string },
  ) {
    if (!runs.length) {
      this.doc.x = x;
      this.doc.y = y;
      return;
    }

    const lines: InlineRun[][] = [[]];
    for (const run of runs) {
      if (run.text === '\n') {
        lines.push([]);
        continue;
      }
      const parts = run.text.split('\n');
      parts.forEach((part, idx) => {
        if (idx > 0) lines.push([]);
        if (part.length) {
          lines[lines.length - 1].push({ ...run, text: part });
        }
      });
    }

    let cursorY = y;

    for (const lineRuns of lines) {
      if (!lineRuns.length) {
        cursorY += 10.5 + lineGap;
        continue;
      }

      const plain = lineRuns.map((r) => r.text).join('');
      this.doc.font('Helvetica').fontSize(10.5);
      const lineHeight = this.doc.heightOfString(plain, {
        width,
        lineGap,
      });

      for (let i = 0; i < lineRuns.length; i++) {
        const run = lineRuns[i];
        const isLast = i === lineRuns.length - 1;
        this.applyRunStyle(run, opts);

        // PDFKit overlaps when `width` is set on continued segments —
        // only apply width/lineGap on the final fragment of the line.
        if (i === 0) {
          this.doc.text(run.text, x, cursorY, {
            continued: !isLast,
            underline: !!run.link,
            ...(isLast ? { width, lineGap, align: 'left' as const } : {}),
          });
        } else {
          this.doc.text(run.text, {
            continued: !isLast,
            underline: !!run.link,
            ...(isLast ? { width, lineGap, align: 'left' as const } : {}),
          });
        }
      }

      cursorY += Math.max(lineHeight, 10.5 + lineGap);
    }

    this.doc.x = x;
    this.doc.y = cursorY;
    this.doc.fillColor(COLORS.text).font('Helvetica').fontSize(10.5);
  }
}
