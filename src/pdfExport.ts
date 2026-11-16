import type { JournalEntry, Lang } from './types';
import { formatDate, MOODS } from './utils';

export function exportJournalsToPDF(entries: JournalEntry[], lang: Lang, t: Record<string, any>): void {
  if (entries.length === 0) {
    alert(lang === 'ar' ? 'لا توجد يوميات لتصديرها.' : 'No journals to export.');
    return;
  }

  // Sort newest first or chronological
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  const isRtl = lang === 'ar';
  const printTitle = isRtl ? 'يومياتي - تصدير PDF' : 'Daily Journal - PDF Export';

  const htmlContent = `
<!DOCTYPE html>
<html lang="${lang}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <title>${printTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');

    @page {
      size: A4;
      margin: 15mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #1a2e22;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }

    .header {
      border-bottom: 2px solid #22c55e;
      padding-bottom: 15px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .header h1 {
      margin: 0;
      font-size: 26px;
      color: #166534;
    }

    .header .meta {
      font-size: 13px;
      color: #64748b;
    }

    .entry {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 20px;
      background: #fafdfb;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }

    .entry-date {
      font-size: 16px;
      font-weight: 700;
      color: #15803d;
    }

    .entry-rating {
      font-size: 18px;
      background: #f0fdf4;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid #bbf7d0;
    }

    .section {
      margin-bottom: 12px;
    }

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #166534;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section-content {
      font-size: 14px;
      color: #334155;
      white-space: pre-wrap;
      margin: 0;
    }

    .forgive-box {
      background: #f0fdf4;
      border-right: ${isRtl ? '4px solid #16a34a' : 'none'};
      border-left: ${isRtl ? 'none' : '4px solid #16a34a'};
      border-radius: 6px;
      padding: 10px 14px;
      margin-top: 10px;
    }

    .forgive-title {
      font-size: 13px;
      font-weight: 700;
      color: #15803d;
      margin-bottom: 4px;
    }

    .footer {
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      margin-top: 30px;
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
    }

    @media screen {
      body {
        padding: 30px;
        max-width: 800px;
        margin: 0 auto;
        background: #f8fafc;
      }
      .entry {
        background: #ffffff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }
      .print-bar {
        position: sticky;
        top: 0;
        background: #14532d;
        color: white;
        padding: 12px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 8px;
        margin-bottom: 25px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .print-btn {
        background: #22c55e;
        color: #04130a;
        font-weight: 700;
        border: none;
        padding: 8px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-family: inherit;
      }
      .print-btn:hover {
        background: #4ade80;
      }
    }

    @media print {
      .print-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span>${isRtl ? 'معاينة تصدير PDF' : 'Daily Journal PDF Preview'} (${sorted.length} ${isRtl ? 'يومية' : 'journals'})</span>
    <button class="print-btn" onclick="window.print()">${isRtl ? 'طباعة / حفظ كـ PDF' : 'Print / Save as PDF'}</button>
  </div>

  <div class="header">
    <div>
      <h1>${t.appName || 'Daily Journal'}</h1>
      <div class="meta">${isRtl ? 'تم تصدير اليوميات بتاريخ: ' : 'Exported on: '} ${formatDate(new Date().toISOString().slice(0, 10), lang)}</div>
    </div>
    <div class="meta">
      <strong>${sorted.length}</strong> ${isRtl ? 'يومية محفوظة' : 'entries saved'}
    </div>
  </div>

  ${sorted
    .map((entry) => {
      const moodEmoji = entry.rating ? MOODS[entry.rating - 1] : '';
      return `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-date">${formatDate(entry.date, lang)}</span>
        ${moodEmoji ? `<span class="entry-rating">${moodEmoji}</span>` : ''}
      </div>

      ${entry.dayText ? `
      <div class="section">
        <div class="section-title">${t.q1 || 'How was your day?'}</div>
        <p class="section-content">${escapeHtml(entry.dayText)}</p>
      </div>` : ''}

      ${entry.feelings ? `
      <div class="section">
        <div class="section-title">${t.q2 || 'Feelings'}</div>
        <p class="section-content">${escapeHtml(entry.feelings)}</p>
      </div>` : ''}

      ${entry.story ? `
      <div class="section">
        <div class="section-title">${t.q3 || 'Day Description'}</div>
        <p class="section-content">${escapeHtml(entry.story)}</p>
      </div>` : ''}

      ${entry.forgiveness ? `
      <div class="forgive-box">
        <div class="forgive-title">${t.forgiveTitle || 'Forgiveness'}</div>
        <p class="section-content">${escapeHtml(entry.forgiveness)}</p>
      </div>` : ''}
    </div>
    `;
    })
    .join('')}

  <div class="footer">
    ${t.appName || 'Daily Journal'} – ${t.privacy || 'Your journals are stored privately on this device.'}
  </div>

  <script>
    // Automatically open print dialog for seamless PDF saving
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    // If popup blocked, create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
