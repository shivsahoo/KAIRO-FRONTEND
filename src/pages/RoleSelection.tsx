import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSimulationStore } from '../store/simulationStore';
import type { Role } from '../types';

const roles: { id: Role; title: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'HR Executive',
    title: 'HR Executive',
    description: 'Handle employee relations, recruitment, and workplace scenarios',
    icon: <Users className="w-6 h-6" />,
  },
  {
    id: 'Business Analyst',
    title: 'Business Analyst',
    description: 'Analyze business processes, identify improvements, and drive strategic decisions',
    icon: <TrendingUp className="w-6 h-6" />,
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const setRole = useSimulationStore((state) => state.setRole);
  const [showRoles, setShowRoles] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(0);
  
  const titles = ['Career Growth?', 'Challenges?', 'Master It.', 'Join Kairo!'];

  const handleRoleSelect = (role: Role) => {
    setRole(role);
    navigate('/simulation');
  };

  const handleGetStarted = () => {
    setShowRoles(true);
  };

  useEffect(() => {
    if (currentTitle < titles.length - 1) {
      const timer = setTimeout(() => {
        setCurrentTitle(currentTitle + 1);
      }, 1000); // Show each title for 1.5 seconds
      return () => clearTimeout(timer);
    }
  }, [currentTitle]);

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated blurry bubble background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large bubbles */}
        <motion.div
          animate={{
            x: [0, 150, -50, 0],
            y: [0, 100, -80, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[5%] left-[5%] w-96 h-96 bg-purple-400/40 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -120, 80, 0],
            y: [0, 150, -100, 0],
            scale: [1, 1.4, 0.8, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
          className="absolute top-[50%] right-[5%] w-[500px] h-[500px] bg-cyan-400/35 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 180, -100, 0],
            y: [0, -120, 90, 0],
            scale: [1, 1.2, 1.1, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6,
          }}
          className="absolute bottom-[10%] left-[15%] w-[450px] h-[450px] bg-pink-400/35 rounded-full blur-[110px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 120, 0],
            y: [0, 80, -60, 0],
            scale: [1, 1.5, 0.9, 1],
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.9,
          }}
          className="absolute top-[25%] right-[25%] w-[400px] h-[400px] bg-blue-400/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, 130, -70, 0],
            y: [0, -90, 110, 0],
            scale: [1, 1.3, 1.2, 1],
          }}
          transition={{
            duration: 27,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2,
          }}
          className="absolute bottom-[35%] right-[10%] w-[420px] h-[420px] bg-indigo-400/30 rounded-full blur-[115px]"
        />
        
        {/* Medium bubbles */}
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, 60, -50, 0],
            scale: [1, 1.2, 0.95, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
          className="absolute top-[70%] left-[40%] w-64 h-64 bg-violet-400/35 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{
            x: [0, -90, 50, 0],
            y: [0, 70, -40, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.7,
          }}
          className="absolute top-[15%] left-[50%] w-72 h-72 bg-teal-400/30 rounded-full blur-[90px]"
        />
        <motion.div
          animate={{
            x: [0, 100, -60, 0],
            y: [0, -50, 80, 0],
            scale: [1, 1.1, 1.05, 1],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.1,
          }}
          className="absolute bottom-[25%] left-[60%] w-68 h-68 bg-rose-400/30 rounded-full blur-[85px]"
        />
        
        {/* Small bubbles */}
        <motion.div
          animate={{
            x: [0, 60, -30, 0],
            y: [0, 40, -35, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
          className="absolute top-[40%] left-[70%] w-48 h-48 bg-purple-300/40 rounded-full blur-[60px]"
        />
        <motion.div
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 55, -45, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute bottom-[60%] right-[40%] w-56 h-56 bg-cyan-300/35 rounded-full blur-[70px]"
        />
        <motion.div
          animate={{
            x: [0, 70, -45, 0],
            y: [0, -60, 50, 0],
            scale: [1, 1.1, 1.05, 1],
          }}
          transition={{
            duration: 21,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
          className="absolute top-[80%] right-[50%] w-52 h-52 bg-pink-300/35 rounded-full blur-[65px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl -mt-16 relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="h-24 flex items-center justify-center mb-4 relative">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentTitle}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`text-6xl font-bold absolute ${
                  currentTitle === 3 ? 'text-[#3e67a8]' : 'text-[#5876a7]'
                }`}
              >
                {titles[currentTitle]}
              </motion.h1>
            </AnimatePresence>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl text-light-text-secondary"
          >
            AI Career Simulator - Master real-world workplace challenges, develop professional skills, and advance your career through immersive role-based simulations
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {!showRoles ? (
            <motion.div
              key="get-started"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center mt-12"
            >
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-[#3e67a8] text-white px-8 py-6 text-lg font-semibold shadow-lg hover:bg-[#355892] hover:shadow-xl transition-all duration-300 rounded-full"
              >
                Get Started
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="roles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Role Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {roles.map((role, index) => {
                  return (
                    <motion.button
                      key={role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect(role.id)}
                      className="group bg-white rounded-xl p-6 text-left border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 w-full"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-gray-100 transition-colors duration-200">
                          {role.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold mb-2 text-gray-900">
                            {role.title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer Note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-center text-light-text-secondary mt-6"
              >
                select a role to begin your simulation
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

