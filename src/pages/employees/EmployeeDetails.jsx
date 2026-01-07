import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Table from "../../components/ui/Table";
import { employeeService } from "../../services/employeeService";
import { salaryService } from "../../services/salaryService";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";
import useAuthStore from "../../store/authStore";

export const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [employee, setEmployee] = useState(null);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);

  const [salaryFormData, setSalaryFormData] = useState({
    amount: "",
    effectiveDate: "",
    reason: "",
    notes: "",
  });

  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    salaryId: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeeData, salaryData] = await Promise.all([
        employeeService.getById(id),
        salaryService.getByEmployee(id),
      ]);
      setEmployee(employeeData);
      setSalaryRecords(salaryData || []);
    } catch (err) {
      console.error("Failed to fetch employee data", err);
      setToast({
        isOpen: true,
        message: "Failed to load employee details",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const submitData = {
        employeeId: parseInt(id),
        amount: parseFloat(salaryFormData.amount),
        effectiveDate: salaryFormData.effectiveDate,
        reason: salaryFormData.reason || null,
        notes: salaryFormData.notes || null,
      };

      if (editingSalary) {
        await salaryService.update(editingSalary.id, submitData);
      } else {
        await salaryService.create(submitData);
      }
      fetchData();
      closeSalaryModal();
      setToast({
        isOpen: true,
        message: editingSalary
          ? "Salary record updated successfully"
          : "Salary record created successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Operation failed",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSalary = async (salaryId) => {
    try {
      await salaryService.delete(salaryId);
      fetchData();
      setToast({
        isOpen: true,
        message: "Salary record deleted successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to delete salary record",
        type: "error",
      });
    }
  };

  const handleVoidSalary = async (salaryId) => {
    try {
      await salaryService.void(salaryId);
      fetchData();
      setToast({
        isOpen: true,
        message: "Salary record voided successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to void salary record",
        type: "error",
      });
    }
  };

  const openSalaryModal = () => {
    setEditingSalary(null);
    setSalaryFormData({
      amount: "",
      effectiveDate: new Date().toISOString().split("T")[0],
      reason: "",
      notes: "",
    });
    setIsSalaryModalOpen(true);
  };

  const openEditSalaryModal = (salary) => {
    setEditingSalary(salary);
    setSalaryFormData({
      amount: salary.amount?.toString() || "",
      effectiveDate: salary.effectiveDate || "",
      reason: salary.reason || "",
      notes: salary.notes || "",
    });
    setIsSalaryModalOpen(true);
  };

  const closeSalaryModal = () => {
    setIsSalaryModalOpen(false);
    setEditingSalary(null);
    setSalaryFormData({
      amount: "",
      effectiveDate: "",
      reason: "",
      notes: "",
    });
  };

  const salaryColumns = [
    {
      header: "Amount",
      render: (record) => (
        <span className="font-semibold">
          KSH {record.amount?.toFixed(2) || "0.00"}
        </span>
      ),
    },
    {
      header: "Effective Date",
      render: (record) =>
        record.effectiveDate
          ? new Date(record.effectiveDate).toLocaleDateString()
          : "-",
    },
    {
      header: "End Date",
      render: (record) =>
        record.endDate ? (
          new Date(record.endDate).toLocaleDateString()
        ) : (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
            CURRENT
          </span>
        ),
    },
    {
      header: "Reason",
      accessor: "reason",
    },
    {
      header: "Status",
      render: (record) =>
        record.voided ? (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
            VOIDED
          </span>
        ) : record.endDate ? (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-medium">
            ENDED
          </span>
        ) : (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
            CURRENT
          </span>
        ),
    },
    ...(user?.role === "SALES_REP"
      ? []
      : [
          {
            header: "Actions",
            render: (record) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:bg-blue-50 font-medium px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditSalaryModal(record);
                  }}
                  disabled={record.voided}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-orange-600 hover:bg-orange-50 font-medium px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVoidSalary(record.id);
                  }}
                  disabled={record.voided}
                >
                  Void
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 font-medium px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDialog({ isOpen: true, salaryId: record.id });
                  }}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading employee details...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Employee not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/employees")}
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {employee.fullName}
          </h1>
          {employee.active ? (
            <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium">
              ACTIVE
            </span>
          ) : (
            <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800 font-medium">
              INACTIVE
            </span>
          )}
        </div>
        {user?.role !== "SALES_REP" && (
          <Button onClick={() => navigate(`/employees`)}>Edit Employee</Button>
        )}
      </div>

      {/* Bio Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Employee Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Full Name
            </label>
            <p className="text-gray-900">{employee.fullName || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              ID Number
            </label>
            <p className="text-gray-900">{employee.idNumber || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="text-gray-900">{employee.phoneNumber || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">{employee.email || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Date of Birth
            </label>
            <p className="text-gray-900">
              {employee.dateOfBirth
                ? new Date(employee.dateOfBirth).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Position
            </label>
            <p className="text-gray-900">{employee.position || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Hire Date
            </label>
            <p className="text-gray-900">
              {employee.hireDate
                ? new Date(employee.hireDate).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Termination Date
            </label>
            <p className="text-gray-900">
              {employee.terminationDate
                ? new Date(employee.terminationDate).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Shop</label>
            <p className="text-gray-900">{employee.shopName || "-"}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">Notes</label>
            <p className="text-gray-900">{employee.notes || "-"}</p>
          </div>
        </div>
      </div>

      {/* Current Salary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">Current Salary</h2>
        <p className="text-3xl font-bold">
          {employee.currentSalary
            ? `KSH ${employee.currentSalary.toFixed(2)}`
            : "Not Set"}
        </p>
        <p className="text-sm opacity-90 mt-1">
          {employee.salaryRecordCount || 0} salary record
          {employee.salaryRecordCount !== 1 ? "s" : ""} in history
        </p>
      </div>

      {/* Salary History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Salary History
            </h2>
            {user?.role !== "SALES_REP" && (
              <Button onClick={openSalaryModal}>Add Salary Record</Button>
            )}
          </div>
        </div>
        <div className="p-6">
          {salaryRecords.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No salary records found
            </p>
          ) : (
            <Table
              columns={salaryColumns}
              data={salaryRecords}
              emptyMessage="No salary records found"
              showViewAction={false}
              searchable={false}
            />
          )}
        </div>
      </div>

      {/* Salary Modal */}
      <Modal
        isOpen={isSalaryModalOpen}
        onClose={closeSalaryModal}
        title={editingSalary ? "Edit Salary Record" : "Add Salary Record"}
      >
        <form onSubmit={handleSalarySubmit} className="space-y-4">
          <Input
            label="Amount (KSH)"
            type="number"
            step="0.01"
            value={salaryFormData.amount}
            onChange={(e) =>
              setSalaryFormData({ ...salaryFormData, amount: e.target.value })
            }
            placeholder="0.00"
            required
          />

          <Input
            label="Effective Date"
            type="date"
            value={salaryFormData.effectiveDate}
            onChange={(e) =>
              setSalaryFormData({
                ...salaryFormData,
                effectiveDate: e.target.value,
              })
            }
            required
          />

          <Input
            label="Reason"
            value={salaryFormData.reason}
            onChange={(e) =>
              setSalaryFormData({ ...salaryFormData, reason: e.target.value })
            }
            placeholder="e.g., Annual increment, Promotion"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={salaryFormData.notes}
              onChange={(e) =>
                setSalaryFormData({ ...salaryFormData, notes: e.target.value })
              }
              rows="3"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeSalaryModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editingSalary
                ? "Update Record"
                : "Create Record"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, salaryId: null })}
        onConfirm={() => handleDeleteSalary(confirmDialog.salaryId)}
        title="Delete Salary Record"
        message="Are you sure you want to delete this salary record? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};
