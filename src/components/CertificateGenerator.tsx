import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, X, Award, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateGeneratorProps {
  courseTitle: string;
  studentName: string;
  onClose: () => void;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({ courseTitle, studentName, onClose }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a' // slate-900
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${courseTitle.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-4xl w-full relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Your Certificate of Completion</h2>
          <p className="text-slate-400">Download and share your achievement with the world!</p>
        </div>

        {/* Certificate Preview Container */}
        <div className="overflow-hidden rounded-2xl border-4 border-amber-500/20 shadow-2xl shadow-amber-500/10 mb-8 bg-slate-900 relative">
          
          <div 
            ref={certificateRef} 
            style={{ 
              width: '100%',
              aspectRatio: '1.414/1',
              minHeight: '500px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              position: 'relative',
              padding: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              overflow: 'hidden',
              fontFamily: 'serif'
            }}
          >
            {/* Background Decorations */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '16px', background: 'linear-gradient(to right, #f59e0b, #fde047, #f59e0b)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '16px', background: 'linear-gradient(to right, #f59e0b, #fde047, #f59e0b)' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '16px', height: '100%', background: 'linear-gradient(to bottom, #f59e0b, #fde047, #f59e0b)' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: '16px', height: '100%', background: 'linear-gradient(to bottom, #f59e0b, #fde047, #f59e0b)' }} />
            
            <div style={{ position: 'absolute', top: '48px', left: '48px', width: '128px', height: '128px', borderTop: '2px solid rgba(245, 158, 11, 0.3)', borderLeft: '2px solid rgba(245, 158, 11, 0.3)', borderTopLeftRadius: '24px' }} />
            <div style={{ position: 'absolute', bottom: '48px', right: '48px', width: '128px', height: '128px', borderBottom: '2px solid rgba(245, 158, 11, 0.3)', borderRight: '2px solid rgba(245, 158, 11, 0.3)', borderBottomRightRadius: '24px' }} />

            <div style={{ width: '96px', height: '96px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', border: '1px solid rgba(245, 158, 11, 0.3)', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Award size={48} />
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '24px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Certificate of Completion
            </h1>
            
            <p style={{ fontSize: '1.25rem', marginBottom: '16px', fontStyle: 'italic', color: '#94a3b8' }}>
              This is to certify that
            </p>

            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '0.1em', paddingBottom: '8px', paddingLeft: '48px', paddingRight: '48px', display: 'inline-block', color: '#f59e0b', borderBottom: '2px solid #f59e0b' }}>
              {studentName || "Student"}
            </h2>

            <p style={{ fontSize: '1.25rem', marginBottom: '24px', fontStyle: 'italic', color: '#94a3b8' }}>
              has successfully completed the course
            </p>

            <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '40px', maxWidth: '672px', lineHeight: '1.25' }}>
              {courseTitle}
            </h3>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%', maxWidth: '672px', marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>{currentDate}</p>
                <p style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', margin: '4px 0 0 0' }}>Date</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', fontStyle: 'italic', color: '#f59e0b', margin: 0 }}>SkillPilot AI</p>
                <p style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', margin: '4px 0 0 0' }}>Instructor</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="px-8 py-4 bg-amber-500 text-black rounded-2xl font-bold neon-glow flex items-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {downloading ? (
              <><Loader2 size={20} className="animate-spin" /> Generating PDF...</>
            ) : (
              <><Download size={20} /> Download PDF</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
