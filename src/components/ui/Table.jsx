import { useState } from "react";
import { Spinner } from "./Spinner";
import Modal from "./Modal";

const Table = ({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage = "No data available",
  showViewAction = true, // New prop to enable/disable view button
}) => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleViewRow = (row) => {
    setSelectedRow(row);
    setViewModalOpen(true);
  };

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto max-h-[calc(100vh-280px)]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                    style={{ minWidth: column.width || "auto" }}
                  >
                    {column.header}
                  </th>
                ))}
                {showViewAction && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (showViewAction ? 1 : 0)}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex justify-center items-center gap-3">
                      <Spinner size="sm" />
                      <span>Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (showViewAction ? 1 : 0)}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    onClick={() => onRowClick?.(row)}
                    className={
                      onRowClick
                        ? "cursor-pointer hover:bg-gray-50 transition"
                        : ""
                    }
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column.render
                          ? column.render(row)
                          : row[column.accessor]}
                      </td>
                    ))}
                    {showViewAction && (
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewRow(row);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {showViewAction && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Row Details"
        >
          {selectedRow && (
            <div className="space-y-3">
              {columns.map((column, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-3 last:border-0"
                >
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    {column.header}
                  </div>
                  <div className="text-sm text-gray-900 break-words">
                    {column.render
                      ? column.render(selectedRow)
                      : selectedRow[column.accessor] || "N/A"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </>
  );
};

export default Table;
