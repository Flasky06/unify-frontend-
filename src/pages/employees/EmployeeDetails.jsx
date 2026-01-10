import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Table from "../../components/ui/Table";
import { employeeService } from "../../services/employeeService";
import { expenseService } from "../../services/expenseService";
import { paymentMethodService } from "../../services/paymentMethodService";
import Select from "../../components/ui/Select";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";
import useAuthStore from "../../store/authStore";

export const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [employee, setEmployee] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [submitting, setSubmitting] = useState(false);

  // Pay Salary State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payFormData, setPayFormData] = useState({
    amount: "",
    paymentDate: "",
    notes: "",
    paymentMethodId: "",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeeData, paymentsData, methodsData] = await Promise.all([
        employeeService.getById(id),
        expenseService.getByEmployee(id),
        paymentMethodService.getAll(),
      ]);
      setEmployee(employeeData);
      setPaymentHistory(paymentsData || []);
      setPaymentMethods(methodsData || []);
    } catch (err) {
      console.error("Failed to fetch employee data", err);
      setToast({
        isOpen: true,
        message:
          err.message ||
          "Failed to load employee details. Employee may not exist or you don't have access.",
        type: "error",
      });
      // Navigate back to employee list after showing error
      setTimeout(() => {
        navigate("/employees");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  // Removed Salary History handlers as per requirement

  const handlePaySalarySubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await employeeService.paySalary(id, {
        amount: parseFloat(payFormData.amount),
        paymentDate: payFormData.paymentDate,
        notes: payFormData.notes,
        paymentMethodId: payFormData.paymentMethodId,
        shopId: employee.shopId, // Optional: Use employee's shop
      });
      setIsPayModalOpen(false);
      setToast({
        isOpen: true,
        message: "Salary payment recorded as expense",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to record payment",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openPaySalaryModal = () => {
    setPayFormData({
      amount: employee.currentSalary || "",
      paymentDate: new Date().toISOString().split("T")[0],
      notes: `Salary payment for ${new Date().toLocaleString("default", {
        month: "long",
        year: "numeric",
      })}`,
      paymentMethodId: "",
    });
    setIsPayModalOpen(true);
  };

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
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold mb-2">Current Salary</h2>
          <p className="text-3xl font-bold">
            {employee.currentSalary
              ? `KSH ${employee.currentSalary.toFixed(2)}`
              : "Not Set"}
          </p>
          <p className="text-sm opacity-90 mt-1">Monthly agreed amount</p>
        </div>
        {user?.role !== "SALES_REP" && (
          <Button
            className="bg-white text-blue-600 hover:bg-blue-50 border-transparent shadow"
            onClick={openPaySalaryModal}
          >
            Pay Salary
          </Button>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment History
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            All salary payments made to this employee
          </p>
        </div>
        <div className="p-6">
          {paymentHistory.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No payments recorded yet
            </p>
          ) : (
            <Table
              columns={[
                {
                  header: "Date",
                  render: (payment) =>
                    new Date(payment.date).toLocaleDateString(),
                },
                {
                  header: "Amount",
                  render: (payment) => (
                    <span className="font-semibold">
                      KSH {payment.amount?.toFixed(2) || "0.00"}
                    </span>
                  ),
                },
                {
                  header: "Payment Method",
                  accessor: "paymentMethodName",
                },
                {
                  header: "Notes",
                  accessor: "notes",
                  truncate: true,
                },
              ]}
              data={paymentHistory}
              emptyMessage="No payments found"
              showViewAction={false}
              searchable={false}
            />
          )}
        </div>
      </div>

      {/* Pay Salary Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Record Salary Payment"
      >
        <form onSubmit={handlePaySalarySubmit} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 text-blue-800 text-sm mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mt-0.5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p>
              This will create a new <strong>Expense</strong> record under
              "Salaries & Wages" for this employee.
            </p>
          </div>

          <Input
            label="Amount to Pay (KSH)"
            type="number"
            step="0.01"
            value={payFormData.amount}
            onChange={(e) =>
              setPayFormData({ ...payFormData, amount: e.target.value })
            }
            placeholder="0.00"
            required
          />

          <Input
            label="Payment Date"
            type="date"
            value={payFormData.paymentDate}
            onChange={(e) =>
              setPayFormData({ ...payFormData, paymentDate: e.target.value })
            }
            required
          />

          <Select
            label="Account From (Payment Method)"
            value={payFormData.paymentMethodId}
            onChange={(e) =>
              setPayFormData({
                ...payFormData,
                paymentMethodId: e.target.value,
              })
            }
            options={[
              { value: "", label: "Select Account" },
              ...paymentMethods.map((method) => ({
                value: method.id,
                label: method.name,
              })),
            ]}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes / Description
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={payFormData.notes}
              onChange={(e) =>
                setPayFormData({ ...payFormData, notes: e.target.value })
              }
              rows="3"
              placeholder="e.g. Salary for January"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPayModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Processing..." : "Confirm Payment"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, salaryId: null })}
        onConfirm={() => {}} // No delete action for now
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
