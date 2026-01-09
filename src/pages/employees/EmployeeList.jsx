import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { employeeService } from "../../services/employeeService";
import { shopService } from "../../services/shopService";
import { ConfirmDialog, Toast } from "../../components/ui/ConfirmDialog";
import useAuthStore from "../../store/authStore";

export const EmployeeList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    idNumber: "",
    dateOfBirth: "",
    position: "",
    salary: "",
    hireDate: "",
    shopId: "",
    active: true,
    terminationDate: "",
    notes: "",
  });

  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    employeeId: null,
  });
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [submitting, setSubmitting] = useState(false);

  const [selectedShop, setSelectedShop] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [employeesData, shopsData] = await Promise.all([
        employeeService.getAll().catch((err) => {
          console.error("Employees fetch failed:", err);
          setToast({
            isOpen: true,
            message: `Failed to load employees: ${err.message}`,
            type: "error",
          });
          return [];
        }),
        shopService.getAll().catch((err) => {
          console.error("Shops fetch failed:", err);
          setToast({
            isOpen: true,
            message:
              "Warning: Failed to load shops. Shop filtering may be unavailable.",
            type: "warning",
          });
          return [];
        }),
      ]);
      setEmployees(employeesData || []);
      setShops(shopsData || []);
    } catch (err) {
      console.error("Unexpected error in fetchData", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesShop = selectedShop
        ? employee.shopId?.toString() === selectedShop
        : true;

      const matchesStatus =
        selectedStatus === "all"
          ? true
          : selectedStatus === "active"
          ? employee.active
          : !employee.active;

      const matchesSearch =
        employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.idNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesShop && matchesStatus && matchesSearch;
    });
  }, [employees, selectedShop, selectedStatus, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      const submitData = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email || null,
        idNumber: formData.idNumber || null,
        dateOfBirth: formData.dateOfBirth || null,
        position: formData.position || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        hireDate: formData.hireDate || new Date().toISOString().split("T")[0],
        shopId: formData.shopId ? parseInt(formData.shopId) : null,
        active: formData.active,
        terminationDate: formData.terminationDate || null,
        notes: formData.notes || null,
      };

      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, submitData);
      } else {
        await employeeService.create(submitData);
      }
      fetchData();
      closeModal();
      setToast({
        isOpen: true,
        message: editingEmployee
          ? "Employee updated successfully"
          : "Employee created successfully",
        type: "success",
      });
    } catch (err) {
      setError(err.message || "Operation failed");
      setToast({
        isOpen: true,
        message: err.message || "Operation failed",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await employeeService.delete(id);
      fetchData();
      setToast({
        isOpen: true,
        message: "Employee deleted successfully",
        type: "success",
      });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Failed to delete employee",
        type: "error",
      });
    }
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      idNumber: "",
      dateOfBirth: "",
      position: "",
      salary: "",
      hireDate: new Date().toISOString().split("T")[0],
      shopId: "",
      notes: "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      fullName: employee.fullName || "",
      phoneNumber: employee.phoneNumber || "",
      email: employee.email || "",
      idNumber: employee.idNumber || "",
      dateOfBirth: employee.dateOfBirth || "",
      position: employee.position || "",
      salary: employee.salary?.toString() || "",
      hireDate: employee.hireDate || "",
      shopId: employee.shopId?.toString() || "",
      active: employee.active !== undefined ? employee.active : true,
      terminationDate: employee.terminationDate || "",
      notes: employee.notes || "",
    });
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      idNumber: "",
      dateOfBirth: "",
      position: "",
      salary: "",
      hireDate: "",
      shopId: "",
      notes: "",
    });
  };

  const handleViewDetails = (employee) => {
    navigate(`/employees/${employee.id}`);
  };

  const columns = [
    {
      header: "Name",
      accessor: "fullName",
      triggerView: true,
    },
    {
      header: "ID Number",
      accessor: "idNumber",
    },
    {
      header: "Phone",
      accessor: "phoneNumber",
    },
    {
      header: "Position",
      accessor: "position",
    },
    {
      header: "Current Salary",
      render: (employee) =>
        employee.currentSalary ? (
          <span className="font-semibold">
            KSH {employee.currentSalary.toFixed(2)}
          </span>
        ) : (
          <span className="text-gray-400">Not set</span>
        ),
    },
    { header: "Shop", accessor: "shopName" },
    {
      header: "Status",
      render: (employee) =>
        employee.active ? (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
            ACTIVE
          </span>
        ) : (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-medium">
            INACTIVE
          </span>
        ),
    },
    ...(user?.role === "SALES_REP"
      ? []
      : [
          {
            header: "Actions",
            render: (employee) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:bg-blue-50 font-medium px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(employee);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 font-medium px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDialog({ isOpen: true, employeeId: employee.id });
                  }}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]),
  ];

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Filters */}
        <div className="flex flex-col gap-2 lg:flex-row lg:justify-between lg:items-end lg:flex-wrap">
          <div className="w-full lg:w-48 lg:max-w-xs">
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-1.5 text-sm"
            />
          </div>
          <div className="w-full lg:w-48 lg:max-w-xs">
            <select
              className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={selectedShop}
              onChange={(e) => {
                setSelectedShop(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Shops</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full lg:w-48 lg:max-w-xs">
            <select
              className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="all">All Employees</option>
            </select>
          </div>
        </div>
        {user?.role !== "SALES_REP" && (
          <Button
            onClick={openCreateModal}
            className="w-full lg:w-auto whitespace-nowrap py-1.5"
          >
            Add Employee
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading employees...
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={paginatedEmployees}
              emptyMessage="No employees found matching your criteria."
              showViewAction={false}
              searchable={false}
              onView={handleViewDetails}
            />
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingEmployee ? "Edit Employee" : "Add New Employee"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            placeholder="e.g., John Doe"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              placeholder="e.g., 0712345678"
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="e.g., john@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ID Number"
              value={formData.idNumber}
              onChange={(e) =>
                setFormData({ ...formData, idNumber: e.target.value })
              }
              placeholder="e.g., 12345678"
            />

            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Position"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              placeholder="e.g., Sales Associate"
            />

            <Input
              label="Salary (KSH)"
              type="number"
              step="0.01"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hire Date"
              type="date"
              value={formData.hireDate}
              onChange={(e) =>
                setFormData({ ...formData, hireDate: e.target.value })
              }
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop (Optional)
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={formData.shopId}
                onChange={(e) =>
                  setFormData({ ...formData, shopId: e.target.value })
                }
              >
                <option value="">No Shop</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {editingEmployee && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={formData.active ? "active" : "inactive"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      active: e.target.value === "active",
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <Input
                label="Termination Date (Optional)"
                type="date"
                value={formData.terminationDate}
                onChange={(e) =>
                  setFormData({ ...formData, terminationDate: e.target.value })
                }
              />
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows="3"
              placeholder="Additional notes about the employee..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editingEmployee
                ? "Update Employee"
                : "Create Employee"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, employeeId: null })}
        onConfirm={() => handleDelete(confirmDialog.employeeId)}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
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
