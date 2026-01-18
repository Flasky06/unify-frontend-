const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto print:relative print:z-auto">
      <div className="flex min-h-screen items-center justify-center p-0 sm:p-4 print:block print:min-h-0 print:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity print:hidden"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div
          className={`relative bg-white rounded-none sm:rounded-xl shadow-xl ${sizes[size]} w-full transform transition-all print:shadow-none print:max-w-none`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2 sm:px-6 py-4 border-b border-gray-200 print:hidden">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-2 sm:px-6 py-4 print:p-0">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
