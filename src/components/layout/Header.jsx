import useAuthStore from "../../store/authStore";

export const Header = ({ onMenuClick }) => {
  const { user } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        <button
          className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
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
        <div className="flex items-center gap-4 ml-auto">
          {user?.businessName && (
            <span className="text-gray-700 font-medium">
              {user.businessName}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
