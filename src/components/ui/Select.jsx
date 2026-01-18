export const Select = ({
  label,
  error,
  options = [],
  className = "",
  containerClassName = "",
  ...props
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor={props.id || props.name}
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white ${error ? "border-red-500" : "border-gray-300"
          } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
