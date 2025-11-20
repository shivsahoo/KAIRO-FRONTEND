import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const isLoginPage = location.pathname === '/login';

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/login');
    setShowDropdown(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-light-border backdrop-blur-xl">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left corner */}
          {!isLoginPage ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="cursor-pointer"
            >
              <img src="/logo.png" alt="Kairo Logo" className="h-8 w-8 object-contain rounded" />
            </motion.div>
          ) : (
            <div></div>
          )}

          {/* Right side - User icon with dropdown */}
          {!isLoginPage ? (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDropdown(!showDropdown)}
                onMouseEnter={() => setShowDropdown(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <User className="w-6 h-6 dark:text-gray-500"/>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onMouseLeave={() => setShowDropdown(false)}
                    className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </nav>
  );
}

