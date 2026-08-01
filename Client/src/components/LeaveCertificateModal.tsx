import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import { X, Download, Printer, Award } from 'lucide-react';
import type { LeaveRequest, StudentProfile } from '../types';

interface LeaveCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: LeaveRequest;
  student: StudentProfile;
  classNameStr: string;
  sectionNameStr: string;
}

export const LeaveCertificateModal: React.FC<LeaveCertificateModalProps> = ({
  isOpen,
  onClose,
  leave,
  student,
  classNameStr,
  sectionNameStr
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const totalDays = Math.ceil(
    Math.abs(new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const startFormatted = new Date(leave.startDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const endFormatted = new Date(leave.endDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const dateIssued = new Date(leave.timestamp || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const refNumber = `SVV/LV/2026/${leave.id.substring(leave.id.length - 4).toUpperCase()}`;

  // PDF Generator using A4 coordinates (210mm x 297mm)
  const handleDownloadPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // 1. Draw double borders matching template
    doc.setDrawColor(11, 94, 215); // Primary #0B5ED7
    doc.setLineWidth(0.8);
    doc.rect(10, 10, 190, 277);
    
    doc.setLineWidth(0.2);
    doc.rect(11.5, 11.5, 187, 274);

    // 2. Load School Logo and Official Seal Stamp
    const imgLogo = new Image();
    imgLogo.src = '/logo.png';
    
    const imgSeal = new Image();
    imgSeal.src = '/seal.png';
    
    await Promise.all([
      new Promise((resolve) => {
        imgLogo.onload = resolve;
        imgLogo.onerror = resolve;
      }),
      new Promise((resolve) => {
        imgSeal.onload = resolve;
        imgSeal.onerror = resolve;
      })
    ]);

    if (imgLogo.complete && imgLogo.naturalWidth > 0) {
      doc.addImage(imgLogo, 'PNG', 18, 18, 22, 22);
    }

    // 3. Header Text
    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(11, 94, 215);
    doc.text('SAVITRI VIDYA VIHAR', 108, 26, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(255, 193, 7); // Accent yellow #FFC107
    doc.text('"SHRUTAM ME GOPAY"', 108, 31, { align: 'center' });

    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Affiliated to Central Board of Secondary Education (CBSE)', 108, 36, { align: 'center' });
    doc.text('School Code: 2133525 | Affiliation No: 2133525', 108, 40, { align: 'center' });

    // Divider Line
    doc.setDrawColor(11, 94, 215);
    doc.setLineWidth(0.5);
    doc.line(18, 44, 192, 44);

    // 4. Document Title
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(11, 94, 215);
    doc.text('LEAVE APPROVAL CERTIFICATE', 105, 56, { align: 'center' });
    doc.line(70, 59, 140, 59); // Underline

    // Ref and Date
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(33, 37, 41);
    doc.text(`Ref No: ${refNumber}`, 18, 70);
    doc.text(`Date: ${dateIssued}`, 192, 70, { align: 'right' });

    // 5. Certificate Body Text (times font matching printed certificates)
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(33, 37, 41);

    let y = 92;
    doc.text('This is to certify that leave of absence has been officially sanctioned and granted to Master/', 18, y);
    
    y += 9;
    doc.text('Miss ________________________________________, studying in Class/Section', 18, y);
    
    // Print Student Name on top of the line
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(13);
    doc.setTextColor(11, 94, 215);
    doc.text(student.name, 30, y - 1);
    
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(33, 37, 41);
    y += 9;
    doc.text('____________________, bearing Roll No. ____________________.', 18, y);
    
    // Print Class/Section and Roll Number on top of the lines
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(13);
    doc.setTextColor(11, 94, 215);
    const classText = `${classNameStr} - ${sectionNameStr}`;
    doc.text(classText, 20, y - 1);
    doc.text(student.rollNumber, 75, y - 1);

    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(33, 37, 41);
    y += 18;
    doc.text('The leave is approved for a total duration of __________ day(s), effective from', 18, y);
    
    // Print Duration Days
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(13);
    doc.setTextColor(11, 94, 215);
    doc.text(String(totalDays), 96, y - 1, { align: 'center' });

    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(33, 37, 41);
    y += 9;
    doc.text('____________________ to ____________________, on account of', 18, y);
    
    // Print Start Date and End Date
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(13);
    doc.setTextColor(11, 94, 215);
    doc.text(startFormatted, 20, y - 1);
    doc.text(endFormatted, 68, y - 1);

    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(33, 37, 41);
    y += 9;
    doc.text('______________________________________________________________________.', 18, y);
    
    // Print Reason
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(11);
    doc.setTextColor(11, 94, 215);
    const wrappedReason = doc.splitTextToSize(leave.reason, 160);
    doc.text(wrappedReason, 20, y - 1);

    y += (wrappedReason.length * 5) + 14;
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('It is expected that the student fulfills all missed academic requirements and assignments upon', 18, y);
    y += 6;
    doc.text('returning.', 18, y);

    // 6. Signatures and Seal (Shifted upwards from 218 to 210)
    y = 210;

    // Seal on left (restored to original smaller dimensions: 26x26)
    if (imgSeal.complete && imgSeal.naturalWidth > 0) {
      doc.addImage(imgSeal, 'PNG', 22, y - 5, 26, 26);
    }
    doc.setFont('times', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(11, 94, 215);
    doc.text('OFFICIAL SEAL', 35, y + 25, { align: 'center' });

    // Signature on right
    doc.setFont('courier', 'bolditalic');
    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text('Rohan Rao', 160, y + 4, { align: 'center' });
    
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.3);
    doc.line(135, y + 8, 185, y + 8); // signature line

    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.text('Rohan Rao', 160, y + 13, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Principal', 160, y + 17, { align: 'center' });
    doc.text('Savitri Vidya Vihar', 160, y + 21, { align: 'center' });

    doc.save(`SVV_Leave_Certificate_${student.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrint = () => {
    const printContent = certificateRef.current?.innerHTML;
    
    if (printContent) {
      const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
      if (windowPrint) {
        windowPrint.document.write(`
          <html>
            <head>
              <title>Print Certificate</title>
              <style>
                body { font-family: 'Times New Roman', Times, serif; padding: 20px; color: #212529; }
                .cert-container { border: 4px double #0B5ED7; padding: 30px; position: relative; }
                .bold-val { font-weight: bold; font-style: italic; color: #0B5ED7; text-decoration: underline; }
                .flex-justify { display: flex; justify-content: space-between; margin-top: 50px; }
                .footer-block { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 100px; }
                .seal-img { width: 80px; }
                .sig-line { border-top: 1px solid #777; width: 180px; text-align: center; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="cert-container">
                ${printContent}
              </div>
            </body>
          </html>
        `);
        windowPrint.document.close();
        windowPrint.focus();
        setTimeout(() => {
          windowPrint.print();
          windowPrint.close();
        }, 500);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Toolbar Actions */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 shrink-0">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
            <Award size={18} className="text-primary animate-pulse" />
            Approved Leave Certificate (A4 Format)
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-slate-850"
              title="Print Certificate"
            >
              <Printer size={16} />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary-hover flex items-center gap-1.5 btn-tap-effect"
            >
              <Download size={14} /> Download PDF
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable container for preview */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl flex justify-center items-start">
          <div className="w-full max-w-[700px] aspect-[1/1.414] shadow-premium rounded-xl overflow-hidden shrink-0">
            
            {/* HTML Preview with A4 Ratio - bottom padding increased to push footer up */}
            <div 
              ref={certificateRef}
              className="w-full h-full bg-white text-slate-900 p-8 sm:p-12 pb-16 sm:pb-24 border-[8px] border-double border-primary relative flex flex-col justify-between select-text"
              style={{ minHeight: '940px' }}
            >
              {/* Watermark Logo Background Layer */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
                <img src="/logo.png" alt="watermark" className="w-[380px] h-[380px] object-contain" />
              </div>

              {/* Inner Border Line */}
              <div className="absolute inset-1.5 border border-primary/25 pointer-events-none"></div>

              {/* Header section */}
              <div className="text-center relative">
                <img src="/logo.png" alt="School Logo" className="w-16 h-16 object-contain absolute left-2 top-0" />
                
                <h1 className="text-2xl font-black text-primary tracking-tight font-serif">SAVITRI VIDYA VIHAR</h1>
                <p className="text-[10px] font-black text-amber-500 italic mt-0.5 font-serif">"SHRUTAM ME GOPAY"</p>
                <p className="text-[9px] text-slate-450 font-bold mt-1">Affiliated to Central Board of Secondary Education (CBSE)</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">School Code: 2133525 | Affiliation No: 2133525</p>
                
                <hr className="border-t border-primary/30 mt-3" />
              </div>

              {/* Title */}
              <div className="text-center mt-2">
                <h2 className="text-base font-black text-primary border-b-2 border-primary/30 pb-1 w-fit mx-auto tracking-wide font-serif">
                  LEAVE APPROVAL CERTIFICATE
                </h2>
              </div>

              {/* Metadata (Ref / Date) */}
              <div className="flex justify-between text-xs font-bold text-slate-700 px-2 mt-4">
                <span>Ref No: <span className="underline underline-offset-4 decoration-slate-350">{refNumber}</span></span>
                <span>Date: <span className="underline underline-offset-4 decoration-slate-350">{dateIssued}</span></span>
              </div>

              {/* Body contents filled in lines */}
              <div className="space-y-6 text-sm leading-[2.2] px-2 text-justify font-serif text-slate-800 mt-6 flex-1">
                <p className="indent-8">
                  This is to certify that leave of absence has been officially sanctioned and granted to Master/Miss{' '}
                  <span className="font-sans font-extrabold text-primary underline underline-offset-4 decoration-slate-400 px-2 text-base">{student.name}</span>
                  , studying in Class/Section{' '}
                  <span className="font-sans font-extrabold text-primary underline underline-offset-4 decoration-slate-400 px-2">{classNameStr} - Section {sectionNameStr}</span>
                  , bearing Roll No.{' '}
                  <span className="font-sans font-extrabold text-primary underline underline-offset-4 decoration-slate-400 px-2">{student.rollNumber}</span>.
                </p>

                <p>
                  The leave is approved for a total duration of{' '}
                  <span className="font-sans font-extrabold text-primary underline underline-offset-4 decoration-slate-400 px-2">{totalDays} day(s)</span>
                  , effective from{' '}
                  <span className="font-sans font-extrabold text-primary underline underline-offset-4 decoration-slate-400 px-2">{startFormatted}</span> to{' '}
                  <span className="font-sans font-extrabold text-primary underline underline-offset-4 decoration-slate-400 px-2">{endFormatted}</span>
                  , on account of:{' '}
                  <span className="font-sans font-bold text-primary underline underline-offset-4 decoration-slate-400 px-2 italic">
                    "{leave.reason}"
                  </span>.
                </p>

                <p className="text-xs font-sans text-slate-400 font-bold italic mt-6">
                  It is expected that the student fulfills all missed academic requirements and assignments upon returning.
                </p>
              </div>

              {/* Signature & Stamp - pb-12 pushes the block up from the bottom border */}
              <div className="flex justify-between items-end px-4 pt-6 pb-12 shrink-0">
                {/* Seal - actual seal.png stamp restored to original smaller size */}
                <div className="text-center">
                  <img src="/seal.png" alt="Seal" className="w-14 h-14 object-contain mx-auto" />
                  <span className="block text-[7px] font-black text-primary tracking-widest uppercase mt-1">Official Seal</span>
                </div>

                {/* Principal signature */}
                <div className="text-center w-48">
                  <span className="block font-serif italic text-base text-slate-800 select-none pb-0.5" style={{ fontFamily: 'Georgia, serif' }}>
                    Rohan Rao
                  </span>
                  <div className="border-t border-slate-350 pt-1">
                    <span className="block text-xs font-extrabold text-slate-800">Rohan Rao</span>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Principal</span>
                    <span className="block text-[8px] text-slate-400">Savitri Vidya Vihar</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeaveCertificateModal;
