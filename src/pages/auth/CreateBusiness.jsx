import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { businessService } from "../../services/businessService";
import useAuthStore from "../../store/authStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const CreateBusiness = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    location: "",
    county: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission

    setLoading(true);
    setError(null);

    try {
      if (!formData.businessName || !formData.businessType) {
        throw new Error("Business Name and Type are required");
      }

      const newBusiness = await businessService.createBusiness(formData);

      // Update local user state to reflect the new business (mocking the update since backend might not return full user)
      if (user) {
        updateUser({ ...user, businessId: newBusiness.id }); // Assuming response has ID
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to create business:", err);
      setError(err.message || "Failed to create business");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            Setup Your Business
          </h1>
          <p className="text-gray-600">
            Tell us about your business to get started
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Business Name"
            value={formData.businessName}
            onChange={(e) =>
              setFormData({ ...formData, businessName: e.target.value })
            }
            placeholder="My Business LLC"
            required
          />

          <Input
            label="Business Type"
            value={formData.businessType}
            onChange={(e) =>
              setFormData({ ...formData, businessType: e.target.value })
            }
            placeholder="e.g., Retail, Restaurant"
            required
          />

          <Input
            label="Location (Optional)"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="Business Location"
          />

          <Input
            label="County (Optional)"
            value={formData.county}
            onChange={(e) =>
              setFormData({ ...formData, county: e.target.value })
            }
            placeholder="County"
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating Business..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateBusiness;
