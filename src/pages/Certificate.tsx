import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, ArrowLeft, Loader2 } from 'lucide-react';
import { getCurrentUser } from '../utils/api';

export default function Certificate() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('User');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = await getCurrentUser();
        if (user && user.name) {
          setUserName(user.name);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  const handleDownload = async () => {
    if (!certificateRef.current || downloading) return;

    setDownloading(true);
    try {
      // Wait for fonts to be loaded
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      
      // Wait a bit for all styles to render
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Scroll element into view to ensure it's fully rendered
      certificateRef.current.scrollIntoView({ behavior: 'instant', block: 'center' });
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Import dom-to-image-more dynamically
      const domtoimage = await import('dom-to-image-more');
      
      // Convert to PNG data URL
      const dataUrl = await domtoimage.toPng(certificateRef.current, {
        quality: 1.0,
        bgcolor: '#FFFFFF',
        width: certificateRef.current.offsetWidth,
        height: certificateRef.current.offsetHeight,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `KAIRO_Certificate_${userName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert(`Failed to download certificate: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#787878]">Loading certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#FAFAFA] overflow-y-auto">
      {/* Header */}
      <div className="h-14 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/performance')}
            className="p-2 hover:bg-[#FAFAFA] rounded-[6px] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#0D0D0D]" />
          </button>
          <div>
            <h1 className="text-[15px] font-semibold text-[#0D0D0D] leading-none">Certificate</h1>
            <p className="text-[11px] text-[#787878] mt-0.5">Download Your Certificate</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          {/* Certificate */}
          <div
            ref={certificateRef}
            className="bg-white rounded-[20px] border border-[#E5E5E5] shadow-xl p-20 w-full max-w-4xl mb-10"
            style={{
              aspectRatio: '1.414', // A4 ratio for certificate
              minHeight: '600px',
            }}
          >
            {/* Minimal decorative border */}
            <div className="h-full flex flex-col justify-center items-center relative">
              {/* Top border accent */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#6366F1] to-transparent"></div>
              
              {/* Certificate Content */}
              <div className="text-center space-y-12 px-8">
                {/* Company Name */}
                <div>
                  <h1 
                    className="text-7xl font-bold text-[#6366F1] tracking-tight mb-2"
                    style={{ 
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      letterSpacing: '0.05em'
                    }}
                  >
                    KAIRO
                  </h1>
                </div>

                {/* Divider */}
                <div className="w-32 h-0.5 bg-[#6366F1]/20 mx-auto"></div>

                {/* Certificate Title */}
                <div className="mt-8">
                  <h2 
                    className="text-4xl font-normal text-[#0D0D0D] tracking-wide"
                    style={{ 
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      letterSpacing: '0.1em'
                    }}
                  >
                    Certificate of Experience
                  </h2>
                </div>

                {/* Statement */}
                <div className="my-16 space-y-6">
                  <p 
                    className="text-xl text-[#0D0D0D] leading-relaxed"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    We are pleased to announce
                  </p>
                  <p 
                    className="text-4xl font-semibold text-[#6366F1] my-6"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    {userName}
                  </p>
                  <p 
                    className="text-xl text-[#0D0D0D] leading-relaxed"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    as HR Executive.
                  </p>
                </div>

                {/* Bottom border accent */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#6366F1] to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              disabled={downloading}
              className="px-8 py-3 bg-[#6366F1] text-white rounded-[8px] font-medium text-[15px] hover:bg-[#4F46E5] transition-all hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Certificate
                </>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-white border border-[#E5E5E5] text-[#0D0D0D] rounded-[8px] font-medium text-[15px] hover:bg-[#FAFAFA] transition-all hover:shadow-md"
            >
              Start New Simulation
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

