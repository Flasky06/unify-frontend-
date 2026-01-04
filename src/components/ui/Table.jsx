import { useState, useMemo, useEffect } from "react";
import { Spinner } from "./Spinner";
import Modal from "./Modal";

const Table = ({
  columns,
  data = [],
  onRowClick,
  loading = false,
  emptyMessage = "No data available",
  showViewAction = true,
  searchable = true,
  searchPlaceholder = "Search...",
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  getRowClassName,
}) => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  const handleViewRow = (row) => {
    setSelectedRow(row);
    setViewModalOpen(true);
  };

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchable || !searchQuery.trim()) return data;

    return data.filter((row) => {
      return columns.some((column) => {
        const value = column.accessor
          ? row[column.accessor]
          : column.render
          ? column.render(row)
          : "";

        if (value === null || value === undefined) return false;

        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, columns, searchable]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <>
      {/* Search Input */}
      {searchable && (
        <div className="mb-4">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 w-full">
        <div
          className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)]"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin",
          }}
        >
          <table className="min-w-full divide-y divide-gray-200 w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider bg-gray-50"
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
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (showViewAction ? 1 : 0)}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchQuery ? "No results found" : emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    onClick={() => onRowClick?.(row)}
                    className={`${
                      onRowClick
                        ? "cursor-pointer hover:bg-gray-50 transition"
                        : ""
                    } ${getRowClassName ? getRowClassName(row) : ""}`}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-6 py-3 text-sm text-gray-700 ${
                          column.truncate ? "" : "whitespace-nowrap"
                        }`}
                        style={{
                          maxWidth: column.truncate
                            ? column.maxWidth || "300px"
                            : undefined,
                        }}
                      >
                        {column.truncate ? (
                          <div
                            className={`truncate ${
                              column.triggerView
                                ? "cursor-pointer text-blue-600 hover:text-blue-800 font-bold"
                                : ""
                            }`}
                            title={
                              column.render ? undefined : row[column.accessor]
                            }
                            onClick={(e) => {
                              if (column.triggerView) {
                                e.stopPropagation();
                                handleViewRow(row);
                              }
                            }}
                          >
                            {column.render
                              ? column.render(row)
                              : row[column.accessor]}
                          </div>
                        ) : (
                          <div
                            onClick={(e) => {
                              if (column.triggerView) {
                                e.stopPropagation();
                                handleViewRow(row);
                              }
                            }}
                            className={
                              column.triggerView
                                ? "cursor-pointer text-blue-600 hover:text-blue-800 font-bold"
                                : ""
                            }
                          >
                            {column.render
                              ? column.render(row)
                              : row[column.accessor]}
                          </div>
                        )}
                      </td>
                    ))}
                    {showViewAction && (
                      <td className="px-6 py-2.5 text-base font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewRow(row);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-bold"
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

      {/* Pagination Controls */}
      {!loading && filteredData.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>
              of {filteredData.length}{" "}
              {filteredData.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsisBefore =
                    index > 0 && page - array[index - 1] > 1;

                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsisBefore && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 border rounded ${
                          currentPage === page
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

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
