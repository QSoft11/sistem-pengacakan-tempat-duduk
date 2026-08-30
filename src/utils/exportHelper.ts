import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { ClassroomConfig, Seat } from '../types/seating';

// SVG Icons as strings for standalone offscreen rendering
const SVG_ICONS = {
  presentation: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>`,
  laptop: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>`,
  armchair: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z"/><path d="M5 18v2"/><path d="M19 18v2"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="#dc2626" stroke="#dc2626" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  door: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h20"/><path d="M13 20V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16"/><path d="M9 12v.01"/></svg>`,
  pin: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#78350f" stroke="#78350f" stroke-width="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>`,
};

/**
 * Creates a standalone, pixel-perfect DOM node representing the full classroom layout.
 * Completely immune to mobile viewport clipping, media query overrides, or animation glitches.
 */
function createClassroomExportDom(seats: Seat[], config: ClassroomConfig): { container: HTMLElement; width: number; cleanup: () => void } {
  const { rows, cols, arrangement, frontPosition, showSeatNumbers, showAisleMarkers, title, teacherName, roomNumber, teacherDeskPosition, date, validUntilDate } = config;
  const pairsPerRow = Math.ceil(cols / 2);
  const isDeskRight = teacherDeskPosition === 'top-right';

  // Group seats by row
  const rowsMap: Seat[][] = [];
  for (let r = 0; r < rows; r++) {
    rowsMap.push([]);
  }
  seats.forEach((seat) => {
    if (rowsMap[seat.row]) {
      rowsMap[seat.row].push(seat);
    }
  });
  rowsMap.forEach((rowSeats) => rowSeats.sort((a, b) => a.col - b.col));

  // Determine export width
  const exportWidth = arrangement === '2-2'
    ? Math.max(1240, pairsPerRow * 270 + 80)
    : Math.max(1240, cols * 145 + 80);

  const container = document.createElement('div');
  container.id = 'classroom-export-standalone';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: ${exportWidth}px;
    background: #f8fafc;
    padding: 32px;
    box-sizing: border-box;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #0f172a;
    z-index: -99999;
    pointer-events: none;
  `;

  // 1. Stage Header (Meja Guru + Papan Tulis)
  const teacherDeskHtml = `
    <div style="width: 300px; min-width: 300px; max-width: 300px; flex-shrink: 0; background: linear-gradient(135deg, #fbbf24, #fcd34d, #f59e0b); color: #172554; border-radius: 18px; padding: 16px; border: 2px solid #f59e0b; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; background: #1e3a8a; color: #fde047; padding: 2px 8px; border-radius: 6px;">
          ${isDeskRight ? 'POJOK KANAN ATAS' : 'POJOK KIRI ATAS'}
        </span>
        <span style="width: 10px; height: 10px; border-radius: 50%; background: #059669;"></span>
      </div>

      <div style="display: flex; align-items: center; gap: 12px; margin: 12px 0;">
        <div style="width: 44px; height: 44px; border-radius: 12px; background: #1e3a8a; color: #fde047; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          ${SVG_ICONS.presentation}
        </div>
        <div style="min-width: 0;">
          <div style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em;">MEJA GURU</div>
          <div style="font-size: 13px; font-weight: 800; color: #172554; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${teacherName || 'Bapak/Ibu Guru'}
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #172554; border-top: 1px solid rgba(245, 158, 11, 0.5); padding-top: 8px;">
        <span>Ruang: ${roomNumber || 'Kelas'}</span>
        <span style="display: flex; align-items: center; gap: 4px;">
          ${SVG_ICONS.laptop} Aktif Mengajar
        </span>
      </div>
    </div>
  `;

  const blackboardHtml = `
    <div style="flex: 1; min-width: 0; background: linear-gradient(90deg, #1d4ed8, #2563eb, #4338ca); color: #ffffff; border-radius: 18px; padding: 16px 24px; border: 2px solid #3b82f6; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #fde047;"></div>
          <span style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;">
            PAPAN TULIS UTAMA (DEPAN KELAS)
          </span>
        </div>
        <span style="font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; font-weight: 700; background: rgba(255, 255, 255, 0.2); padding: 4px 12px; border-radius: 8px;">
          ${title || 'Mata Pelajaran'}
        </span>
      </div>

      <div style="width: 100%; height: 6px; background: #93c5fd; border-radius: 9999px; margin: 10px 0; opacity: 0.8;"></div>

      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #dbeafe; font-weight: 600;">
        <span>Masa Berlaku: ${date} s.d. ${validUntilDate || date}</span>
        <span style="color: #fef08a; font-weight: 700;">Baris 1 & 2 Prioritas Mata Minus</span>
      </div>
    </div>
  `;

  const stageHeaderHtml = `
    <div style="display: flex; flex-direction: row; align-items: stretch; gap: 16px; width: 100%; margin-bottom: 24px;">
      ${isDeskRight ? `${blackboardHtml}${teacherDeskHtml}` : `${teacherDeskHtml}${blackboardHtml}`}
    </div>
  `;

  // 2. Seating Grid Helper
  function renderDeskCardHtml(seat: Seat, arrangementType: '1-1' | '2-2'): string {
    const { label, studentName, absenNo, isPriorityFront, isEmpty, isPinned, pairSide } = seat;
    const numDisplay = absenNo !== undefined ? (absenNo < 10 ? `0${absenNo}` : `${absenNo}`) : '';

    let cardBg = '#ffffff';
    let cardBorder = '2px solid #e2e8f0';
    let borderRadius = '16px';

    if (arrangementType === '2-2') {
      if (pairSide === 'left') {
        borderRadius = '16px 6px 6px 16px';
        cardBorder = '2px solid #cbd5e1; border-right: 2px dashed #94a3b8';
      } else {
        borderRadius = '6px 16px 16px 6px';
        cardBorder = '2px solid #cbd5e1; border-left: 2px dashed #94a3b8';
      }
    }

    if (isEmpty) {
      cardBg = '#f8fafc';
      cardBorder = '2px dashed #cbd5e1';
    } else if (isPriorityFront) {
      cardBg = '#fef2f2';
      cardBorder = '2px solid #f87171';
    } else if (isPinned) {
      cardBg = '#fffbeb';
      cardBorder = '2px solid #fbbf24';
    }

    let labelBg = '#dbeafe';
    let labelColor = '#1e40af';
    if (isEmpty) {
      labelBg = '#e2e8f0';
      labelColor = '#475569';
    } else if (isPriorityFront) {
      labelBg = '#fee2e2';
      labelColor = '#991b1b';
    }

    const isRealName = Boolean(studentName && !/^absen[\s\.\:\-]*\d+$/i.test(studentName.trim()));
    const isNameMode = config.displayMode === 'name-primary' || (isRealName && config.displayMode !== 'absen-only');

    let badgeContent = '';
    if (isEmpty) {
      badgeContent = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; color: #94a3b8;">
          ${SVG_ICONS.armchair}
          <span style="font-size: 11px; font-weight: 700; color: #94a3b8;">Kosong</span>
        </div>
      `;
    } else if (isNameMode) {
      // Mode Nama Siswa
      let nameBoxBg = '#eff6ff';
      let nameBoxBorder = '#bfdbfe';
      let nameColor = '#172554';

      if (isPriorityFront) {
        nameBoxBg = '#dc2626';
        nameBoxBorder = '#b91c1c';
        nameColor = '#ffffff';
      } else if (isPinned) {
        nameBoxBg = '#fbbf24';
        nameBoxBorder = '#f59e0b';
        nameColor = '#451a03';
      }

      let subTag = '';
      if (isPriorityFront) {
        subTag = `
          <span style="display: inline-flex; align-items: center; gap: 3px; font-size: 9px; font-weight: 900; color: #991b1b; background: #fee2e2; padding: 1px 6px; border-radius: 9999px; border: 1px solid #fecaca;">
            ${SVG_ICONS.star} Prioritas
          </span>
        `;
      } else if (isPinned) {
        subTag = `
          <span style="display: inline-flex; align-items: center; gap: 3px; font-size: 9px; font-weight: 900; color: #78350f; background: #fef3c7; padding: 1px 6px; border-radius: 9999px; border: 1px solid #fde68a;">
            ${SVG_ICONS.pin} Terkunci
          </span>
        `;
      }

      badgeContent = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; gap: 4px;">
          <div style="width: 100%; padding: 4px 6px; border-radius: 10px; background: ${nameBoxBg}; color: ${nameColor}; border: 1px solid ${nameBoxBorder}; display: flex; align-items: center; justify-content: center; text-align: center;">
            <span style="font-size: 13px; font-weight: 900; line-height: 1.2; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
              ${studentName}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            ${
              absenNo
                ? `<span style="font-size: 9px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; font-weight: 800; background: #f1f5f9; color: #334155; padding: 1px 5px; border-radius: 4px; border: 1px solid #cbd5e1;">Absen #${numDisplay}</span>`
                : ''
            }
            ${subTag}
          </div>
        </div>
      `;
    } else {
      // Mode Nomor Absen
      let pillBg = '#2563eb';
      let pillBorder = '#1d4ed8';
      let pillColor = '#ffffff';

      if (isPriorityFront) {
        pillBg = '#dc2626';
        pillBorder = '#b91c1c';
      } else if (isPinned) {
        pillBg = '#fbbf24';
        pillBorder = '#f59e0b';
        pillColor = '#451a03';
      }

      let subBadge = '';
      if (isPriorityFront) {
        subBadge = `
          <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 9px; font-weight: 900; color: #b91c1c; background: #fee2e2; padding: 2px 8px; border-radius: 9999px; border: 1px solid #fecaca; margin-top: 4px;">
            ${SVG_ICONS.star} Prioritas Depan
          </span>
        `;
      } else if (isPinned) {
        subBadge = `
          <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 9px; font-weight: 900; color: #78350f; background: #fef3c7; padding: 2px 8px; border-radius: 9999px; border: 1px solid #fde68a; margin-top: 4px;">
            ${SVG_ICONS.pin} Terkunci
          </span>
        `;
      }

      badgeContent = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
          <div style="width: 100%; max-width: 130px; padding: 5px 8px; border-radius: 12px; background: ${pillBg}; color: ${pillColor}; border: 1px solid ${pillBorder}; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
            <span style="font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.02em; opacity: 0.9;">ABSEN</span>
            <span style="font-size: 16px; font-weight: 900; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; line-height: 1;">${numDisplay || '?'}</span>
          </div>
          ${subBadge}
        </div>
      `;
    }

    return `
      <div style="background: ${cardBg}; border: ${cardBorder}; border-radius: ${borderRadius}; height: 126px; padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; text-align: center; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06);">
        <!-- Top Row -->
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <div style="display: flex; align-items: center; gap: 4px;">
            ${
              showSeatNumbers
                ? `<span style="font-size: 11px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; font-weight: 800; background: ${labelBg}; color: ${labelColor}; padding: 1px 6px; border-radius: 6px;">${label}</span>`
                : ''
            }
            ${
              arrangementType === '2-2'
                ? `<span style="font-size: 9px; color: #94a3b8; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">${
                    pairSide === 'left' ? 'Kiri' : 'Kanan'
                  }</span>`
                : ''
            }
          </div>
          ${isPinned ? `<span style="display: inline-flex; align-items: center;">${SVG_ICONS.pin}</span>` : ''}
        </div>

        <!-- Center Attendance Content -->
        <div style="margin: auto 0; display: flex; align-items: center; justify-content: center; width: 100%;">
          ${badgeContent}
        </div>

        <div style="height: 4px;"></div>
      </div>
    `;
  }

  // Seating grid container
  let gridHtml = '';

  if (arrangement === '1-1') {
    gridHtml = `
      <div style="display: grid; grid-template-columns: repeat(${cols}, minmax(130px, 1fr)); gap: 14px; width: 100%; margin: 16px 0;">
        ${seats.map((s) => renderDeskCardHtml(s, '1-1')).join('')}
      </div>
    `;
  } else {
    // 2-2 Layout with Pairs
    let pairHeadersHtml = '';
    if (showAisleMarkers && pairsPerRow > 1) {
      pairHeadersHtml = `
        <div style="display: grid; grid-template-columns: repeat(${pairsPerRow}, minmax(240px, 1fr)); gap: 20px; width: 100%; margin-bottom: 8px;">
          ${Array.from({ length: pairsPerRow })
            .map(
              (_, pIdx) => `
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; font-weight: 700; color: #1d4ed8; background: #eff6ff; padding: 6px 12px; border-radius: 8px; border: 1px solid #dbeafe;">
              <span>Kelompok Meja ${pIdx + 1}</span>
              ${pIdx < pairsPerRow - 1 ? '<span style="font-size: 10px; color: #d97706; font-weight: 600;">[ Lorong ]</span>' : ''}
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    const rowsHtml = rowsMap
      .map((rowSeats) => {
        const pairs: Seat[][] = [];
        for (let i = 0; i < rowSeats.length; i += 2) {
          pairs.push(rowSeats.slice(i, i + 2));
        }

        return `
          <div style="display: grid; grid-template-columns: repeat(${pairsPerRow}, minmax(240px, 1fr)); gap: 20px; width: 100%; align-items: center;">
            ${pairs
              .map(
                (pair) => `
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; background: #f1f5f9; padding: 6px; border-radius: 18px; border: 2px solid #e2e8f0;">
                ${pair.map((s) => renderDeskCardHtml(s, '2-2')).join('')}
              </div>
            `
              )
              .join('')}
          </div>
        `;
      })
      .join('');

    gridHtml = `
      <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; margin: 16px 0;">
        ${pairHeadersHtml}
        ${rowsHtml}
      </div>
    `;
  }

  // 3. Rear Banner
  const rearBannerHtml = `
    <div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-top: 24px;">
      <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b; font-weight: 700; padding: 8px 24px; border-radius: 9999px; border: 2px dashed #cbd5e1; background: #ffffff;">
        ${SVG_ICONS.door}
        <span>RUANG LEYEH-LEYEH MAS EGA ANGGORO & MAS DAMA</span>
      </div>
    </div>
  `;

  // Assemble container innerHTML based on frontPosition
  container.innerHTML = `
    ${frontPosition === 'top' ? stageHeaderHtml : ''}
    ${gridHtml}
    ${frontPosition === 'bottom' ? stageHeaderHtml : rearBannerHtml}
  `;

  document.body.appendChild(container);

  return {
    container,
    width: exportWidth,
    cleanup: () => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    },
  };
}

/**
 * Exports the classroom seating chart as high-resolution PNG.
 */
export async function exportSeatsAsPng(
  seats: Seat[],
  config: ClassroomConfig,
  filename: string = 'denah-tempat-duduk.png'
): Promise<boolean> {
  let cleanup: (() => void) | null = null;
  try {
    const { container, width, cleanup: cleanupFn } = createClassroomExportDom(seats, config);
    cleanup = cleanupFn;

    // Small delay to ensure browser layout computation
    await new Promise((r) => setTimeout(r, 60));

    const height = container.offsetHeight || container.scrollHeight;

    const dataUrl = await toPng(container, {
      quality: 0.98,
      pixelRatio: 2,
      width,
      height,
      canvasWidth: width * 2,
      canvasHeight: height * 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      style: {
        position: 'static',
        left: '0',
        top: '0',
        transform: 'none',
        margin: '0',
        opacity: '1',
      },
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('Gagal mengekspor PNG:', error);
    return false;
  } finally {
    if (cleanup) cleanup();
  }
}

/**
 * Exports the classroom seating chart as an A4 Landscape PDF.
 */
export async function exportSeatsAsPdf(
  seats: Seat[],
  config: ClassroomConfig,
  filename: string = 'denah-tempat-duduk.pdf'
): Promise<boolean> {
  let cleanup: (() => void) | null = null;
  try {
    const { container, width, cleanup: cleanupFn } = createClassroomExportDom(seats, config);
    cleanup = cleanupFn;

    await new Promise((r) => setTimeout(r, 60));

    const height = container.offsetHeight || container.scrollHeight;

    const dataUrl = await toPng(container, {
      quality: 0.98,
      pixelRatio: 2,
      width,
      height,
      canvasWidth: width * 2,
      canvasHeight: height * 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      style: {
        position: 'static',
        left: '0',
        top: '0',
        transform: 'none',
        margin: '0',
        opacity: '1',
      },
    });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 297mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 210mm
    const margin = 14;

    // Header styling
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(29, 78, 216); // blue-700
    pdf.text(config.title || 'Denah Tempat Duduk Kelas', margin, margin + 4);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105); // slate-600
    const subtitle = `Wali Kelas / Guru: ${config.teacherName || '-'}  •  Ruang: ${
      config.roomNumber || '-'
    }  •  Tanggal: ${config.date || '27 Agustus 2026'}`;
    pdf.text(subtitle, margin, margin + 11);

    // Divider line
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.4);
    pdf.line(margin, margin + 14, pageWidth - margin, margin + 14);

    // Fit image inside available space
    const startY = margin + 18;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - startY - 14;

    const img = new Image();
    img.src = dataUrl;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const imgAspect = img.width / img.height;
    let renderWidth = availableWidth;
    let renderHeight = renderWidth / imgAspect;

    if (renderHeight > availableHeight) {
      renderHeight = availableHeight;
      renderWidth = renderHeight * imgAspect;
    }

    const renderX = margin + (availableWidth - renderWidth) / 2;
    const renderY = startY + (availableHeight - renderHeight) / 2;

    pdf.addImage(dataUrl, 'PNG', renderX, renderY, renderWidth, renderHeight, undefined, 'FAST');

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(
      `Dibuat dengan SeatCraft • Susunan ${
        config.arrangement === '2-2' ? '2-2 Meja Gandeng' : '1-1 Meja Mandiri'
      } • ${config.rows} Baris × ${config.cols} Meja`,
      margin,
      pageHeight - 8
    );

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Gagal mengekspor PDF:', error);
    return false;
  } finally {
    if (cleanup) cleanup();
  }
}

/**
 * Backward-compatible wrapper for DOM element export
 */
export async function exportElementAsPng(
  element: HTMLElement,
  config?: ClassroomConfig,
  filename: string = 'denah-tempat-duduk.png'
): Promise<boolean> {
  // If element or direct export is used, fallback smoothly
  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    return true;
  } catch {
    return false;
  }
}

export async function exportElementAsPdf(
  element: HTMLElement,
  config: ClassroomConfig,
  filename: string = 'denah-tempat-duduk.pdf'
): Promise<boolean> {
  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    pdf.addImage(dataUrl, 'PNG', 10, 10, 277, 190, undefined, 'FAST');
    pdf.save(filename);
    return true;
  } catch {
    return false;
  }
}

export function exportSeatsToCsv(seats: Seat[], config: ClassroomConfig): void {
  const headers = [
    'Nomor Kursi',
    'Baris',
    'Kolom',
    'No Absen',
    'Nama Siswa',
    'Mata Minus',
    'Status',
    'Terkunci',
  ];
  const rows = seats.map((seat) => [
    seat.label,
    seat.row + 1,
    seat.col + 1,
    seat.absenNo || '',
    `"${seat.studentName || ''}"`,
    seat.hasMinus ? 'Ya' : 'Tidak',
    seat.isEmpty ? 'Kosong' : 'Terisi',
    seat.isPinned ? 'Ya' : 'Tidak',
  ]);

  const csvContent = [
    `# ${config.title} - Denah Tempat Duduk`,
    `# Tanggal: ${config.date || new Date().toISOString().slice(0, 10)}`,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${config.title.toLowerCase().replace(/[\s\.\•]+/g, '-')}-denah.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
