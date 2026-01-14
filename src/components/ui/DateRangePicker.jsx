import React from "react";
import { format } from "date-fns";

export const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const handleStartDateChange = (e) => {
    if (e.target.value) {
      // Parse the date string as local date (not UTC)
      const [year, month, day] = e.target.value.split("-").map(Number);
      const newDate = new Date(year, month - 1, day);
      onChange({ startDate: newDate, endDate });
    }
  };

  const handleEndDateChange = (e) => {
    if (e.target.value) {
      // Parse the date string as local date (not UTC)
      const [year, month, day] = e.target.value.split("-").map(Number);
      const newDate = new Date(year, month - 1, day);
      onChange({ startDate, endDate: newDate });
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-300">
      <input
        type="date"
        value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
        onChange={handleStartDateChange}
        className="bg-white text-gray-900 text-sm px-2 py-1 outline-none focus:bg-gray-50 rounded border-0"
      />
      <span className="text-gray-400 font-medium">-</span>
      <input
        type="date"
        value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
        onChange={handleEndDateChange}
        className="bg-white text-gray-900 text-sm px-2 py-1 outline-none focus:bg-gray-50 rounded border-0"
      />
    </div>
  );
};
