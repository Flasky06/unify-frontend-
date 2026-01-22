

export const Header = ({ onMenuClick }) => {

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 py-2 md:py-3 relative">
      <div className="flex items-center justify-between w-full h-full min-h-[24px]">
        {/* Logo - visible on mobile when sidebar is hidden */}
        <h1 className="text-2xl font-bold text-gray-900 tracking-wide lg:hidden">
          <span className="text-blue-500">M</span>flow POS
        </h1>
        <div className="hidden lg:block" /> {/* Spacer for desktop */}

        <button
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
          onClick={onMenuClick}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};
