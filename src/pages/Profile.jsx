import { useState, useEffect } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import useAuthStore from "../store/authStore";
import { apiFetch } from "../lib/api";
import { businessService } from "../services/businessService";

const Profile = () => {
  const { user, updateUser } = useAuthStore();
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
    location: "",
    county: "",
  });

  const [hasBusiness, setHasBusiness] = useState(false);

  // Fetch fresh user data on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get the current token before fetching
        const currentToken = useAuthStore.getState().user?.token;
        const freshUserData = await apiFetch("/users/me");
        console.log("Fetched user profile data:", freshUserData);
        console.log("Current token from store:", currentToken);
        // Preserve the existing token since backend returns null
        updateUser({ ...freshUserData, token: currentToken });
      } catch (err) {
        console.error("Failed to fetch user profile:", {
          message: err.message,
          status: err.status,
          data: err.data,
          fullError: err,
        });
      }
    };

    fetchUserProfile();

    // Fetch business data
    const fetchBusinessData = async () => {
      try {
        const business = await businessService.getMyBusiness();
        console.log("Fetched business data:", business);
        setBusinessData({
          businessName: business.businessName || "",
          businessType: business.businessType || "",
          location: business.location || "",
          county: business.county || "",
        });
        setHasBusiness(true);
      } catch (err) {
        console.error("Failed to fetch business:", {
          message: err.message,
          status: err.status,
          error: err,
        });
        setHasBusiness(false);
      }
    };

    fetchBusinessData();
  }, []);

  // Update form data when user changes
  useEffect(() => {
    console.log("Current user object:", user);
    if (user) {
      setFormData({
        phoneNo: user.phoneNo || "",
      });
      console.log("Form data set to:", {
        phoneNo: user.phoneNo || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      console.log("Submitting profile update with data:", formData);
      console.log("Current user token:", user?.token);

      const updatedUser = await apiFetch("/users/me", {
        method: "PUT",
        body: formData,
      });

      updateUser(updatedUser);

      // Update business if it exists, otherwise create it
      if (hasBusiness) {
        await businessService.updateBusiness(businessData);
      } else if (businessData.businessName && businessData.businessType) {
        // Only attempt to create if we have at least name and type
        await businessService.createBusiness(businessData);
        setHasBusiness(true);
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      phoneNo: user?.phoneNo || "",
    });
    if (hasBusiness) {
      // Reset business data to original values
      businessService.getMyBusiness().then((business) => {
        setBusinessData({
          businessName: business.businessName || "",
          businessType: business.businessType || "",
          location: business.location || "",
          county: business.county || "",
        });
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle=""
        actions={
          !isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <svg
                className="w-5 h-5 mr-2"
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
          )
        }
      />

      <div className="max-w-3xl">
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
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed
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
                  placeholder="e.g., Retail, Restaurant"
                />

                <Input
                  label="Location"
                  value={businessData.location}
                  onChange={(e) =>
                    setBusinessData({
                      ...businessData,
                      location: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  placeholder="Business Location"
                />

                <Input
                  label="County"
                  value={businessData.county}
                  onChange={(e) =>
                    setBusinessData({
                      ...businessData,
                      county: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  placeholder="County"
                />
              </div>
            </div>
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
      </div>
    </div>
  );
};

export default Profile;
