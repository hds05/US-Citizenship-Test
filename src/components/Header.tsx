'use client';

interface HeaderProps {
  variant?: 'default' | 'test-complete' | 'instructions';
  backgroundImage?: string;
  className?: string;
}

export default function Header({ 
  variant = 'default', 
  backgroundImage,
  className = '' 
}: HeaderProps) {
  const getHeaderStyles = () => {
    switch (variant) {
      case 'test-complete':
        return {
          container: "bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm",
          logo: "w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center",
          title: "text-lg sm:text-xl font-bold text-gray-800",
          subtitle: "text-gray-600 text-xs sm:text-sm",
          layout: "flex items-center space-x-3"
        };
      case 'instructions':
        return {
          container: "relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl",
          logo: "w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
          title: "text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent",
          subtitle: "text-blue-300 text-xs sm:text-sm font-medium",
          layout: "flex items-center justify-center space-x-3 sm:space-x-4 group"
        };
      default:
        return {
          container: "relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl",
          logo: "w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
          title: "text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent",
          subtitle: "text-blue-300 text-xs sm:text-sm font-medium",
          layout: "flex items-center justify-center space-x-3 sm:space-x-4 group"
        };
    }
  };

  const styles = getHeaderStyles();

  return (
    <header 
      className={`${styles.container} ${className}`}
      style={backgroundImage ? { 
        backgroundImage: `url('${backgroundImage}')`, 
        backgroundSize: "cover", 
        backgroundPosition: "center" 
      } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className={styles.layout}>
          <div className={styles.logo}>
            <span className="text-white font-bold text-lg sm:text-xl">BB</span>
          </div>
          <div className="text-center sm:text-left">
            <h1 className={styles.title}>
              BB-Global Solutions
            </h1>
            <p className={styles.subtitle}>Innovative Technology Solutions</p>
          </div>
        </div>
      </div>
    </header>
  );
}
