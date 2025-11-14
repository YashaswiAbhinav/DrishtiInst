import { Heart, Code2, Linkedin, Github } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface DeveloperCardProps {
  name: string;
  role: string;
  linkedinUrl: string;
  githubUrl?: string;
  avatar: string;
}

function DeveloperCard({ name, role, linkedinUrl, githubUrl, avatar }: DeveloperCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  let hoverTimeout: NodeJS.Timeout;

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="text-blue-400 hover:text-blue-300 transition-colors font-medium cursor-pointer">
        {name}
      </span>
      
      {isHovered && (
        <div 
          className="absolute bottom-full mb-2 z-50 transform -translate-x-1/2"
          style={{ left: '50%' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 min-w-[200px]"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {avatar}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{name}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{role}</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <a 
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Linkedin className="h-3 w-3" />
              </a>
              {githubUrl && (
                <a 
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Github className="h-3 w-3" />
                </a>
              )}
            </div>
          </motion.div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}

export default function DeveloperCredits() {
  return (
    <div className="text-center py-3 border-t border-gray-800">
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Code2 className="h-3 w-3 text-blue-400" />
        </motion.div>
        <span>Developed with</span>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart className="h-3 w-3 text-red-500 fill-current" />
        </motion.div>
        <span>by</span>
        <DeveloperCard 
          name="Abhinav"
          role="Full Stack Developer"
          linkedinUrl="https://www.linkedin.com/in/yashaswi-abhinav-39018b282/"
          githubUrl="https://github.com/YashaswiAbhinav"
          avatar="A"
        />
        <span>&</span>
        <DeveloperCard 
          name="Ankit Raj"
          role="Mobile Developer"
          linkedinUrl="https://www.linkedin.com/in/ankit-raj-bab4bb280/"
          githubUrl="https://github.com/LUAMICIFER"
          avatar="A"
        />
      </div>
    </div>
  );
}