import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { ClassroomConfig, Seat } from '../types/seating';

export async function exportElementAsPng(
  element: HTMLElement,
  filename: string = 'denah-tempat-duduk.png'
): Promise<boolean> {
  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      filter: (node: HTMLElement) => {
        return !node.classList?.contains('export-ignore');
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
      filter: (node: HTMLElement) => !node.classList?.contains('export-ignore'),
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

    // Subtle divider line
    pdf.setDrawColor(203, 213, 225); // slate-300
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
    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.text(
      `Dibuat dengan SeatCraft • Susunan ${config.arrangement === '2-2' ? '2-2 Meja Gandeng' : '1-1 Meja Mandiri'} • ${config.rows} Baris × ${config.cols} Meja`,
      margin,
      pageHeight - 8
    );

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Gagal mengekspor PDF:', error);
    return false;
  }
}

export function exportSeatsToCsv(seats: Seat[], config: ClassroomConfig): void {
  const headers = ['Nomor Kursi', 'Baris', 'Kolom', 'No Absen', 'Nama Siswa', 'Mata Minus', 'Status', 'Terkunci'];
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
