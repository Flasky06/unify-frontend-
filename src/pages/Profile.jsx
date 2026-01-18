import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import { MySubscription } from "./MySubscription";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import { userService } from "../services/userService";
import { businessService } from "../services/businessService";

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    phoneNo: "",
  });

  const [businessData, setBusinessData] = useState({
    businessName: "",
    businessType: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        phoneNo: user.phoneNo || "",
      });
      if (user.business) {
        setBusinessData({
          businessName: user.business.businessName || "",
          businessType: user.business.businessType || "",
          address: user.business.address || "",
        });
      }
    }
  }, [user]);

  // Fetch business data if user has businessId but business object is not populated
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (user?.businessId && !user?.business) {
        try {
          const business = await businessService.getMyBusiness();
          updateUser({ ...user, business });
          setBusinessData({
            businessName: business.businessName || "",
            businessType: business.businessType || "",
            address: business.address || "",
          });
        } catch (err) {
          console.error("Failed to fetch business data:", err);
        }
      }
    };
    fetchBusinessData();
  }, [user?.businessId, user?.business]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update User
      const updatedUser = await userService.updateMyProfile({
        phoneNo: formData.phoneNo,
      });

      // Update Business (if applicable)
      let updatedBusiness = null;
      if (
        user.business &&
        (user.role === "BUSINESS_OWNER" || user.role === "BUSINESS_MANAGER")
      ) {
        updatedBusiness = await businessService.updateBusiness({
          businessName: businessData.businessName,
          businessType: businessData.businessType,
          address: businessData.address,
        });
      }

      // Update Local Store
      updateUser({
        ...updatedUser,
        business: updatedBusiness || user.business,
      });

      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    if (user) {
      setFormData({ phoneNo: user.phoneNo || "" });
      if (user.business) {
        setBusinessData({
          businessName: user.business.businessName || "",
          businessType: user.business.businessType || "",
          address: user.business.address || "",
        });
      }
    }
  };

  const isBusinessUser =
    user?.role === "BUSINESS_OWNER" || user?.role === "BUSINESS_MANAGER";

  return (
    <div>
      <div className="mb-6 border-b border-gray-200 flex justify-between items-end">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === "overview"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Overview
          </button>
          {isBusinessUser && (
            <button
              onClick={() => setActiveTab("subscription")}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === "subscription"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Subscription
            </button>
          )}
        </nav>

        {activeTab === "overview" && !isEditing && (
          <div className="pb-2">
            <Button onClick={() => setIsEditing(true)} size="sm">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-4xl">
        {activeTab === "overview" && (
          <>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Phone Number"
                    value={formData.phoneNo}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNo: e.target.value })
                    }
                    disabled={!isEditing}
                    placeholder="+254..."
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                      {user?.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                      {user?.role?.replace("_", " ")}
                    </p>
                  </div>
                </div>

                {isBusinessUser && (user?.business || user?.businessId) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Business Name"
                        value={businessData.businessName}
                        onChange={(e) =>
                          setBusinessData({
                            ...businessData,
                            businessName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="Your Business Name"
                      />
                      <Input
                        label="Business Type"
                        value={businessData.businessType}
                        onChange={(e) =>
                          setBusinessData({
                            ...businessData,
                            businessType: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="e.g. Retail"
                      />
                      <Input
                        label="Address"
                        value={businessData.address}
                        onChange={(e) =>
                          setBusinessData({
                            ...businessData,
                            address: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="Business Address"
                      />
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </>
        )}

        {isBusinessUser && activeTab === "subscription" && <MySubscription />}
      </div>
    </div>
  );
};

export default Profile;
