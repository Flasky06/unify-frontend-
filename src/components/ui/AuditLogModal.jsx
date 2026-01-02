import React from "react";
import Modal from "./Modal";
import { format } from "date-fns";

const AuditLogModal = ({ isOpen, onClose, title, logs, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "Audit History"}>
      <div className="mt-4">
        {loading ? (
          <div className="text-center py-4">Loading history...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No history found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Date/Time
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-base font-medium text-gray-500 whitespace-nowrap">
                      {format(new Date(log.timestamp), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-3 py-2 text-base font-medium text-gray-900">
                      {log.performedBy}
                    </td>
                    <td className="px-3 py-2 text-base font-medium">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          log.action === "CREATE" || log.action === "INWARD"
                            ? "bg-green-100 text-green-800"
                            : log.action === "CANCEL" || log.action === "DELETE"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-base font-medium text-gray-500">
                      {log.details ||
                        log.reason ||
                        (log.quantityChange
                          ? `Qty: ${log.quantityChange > 0 ? "+" : ""}${
                              log.quantityChange
                            }`
                          : "-")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default AuditLogModal;
