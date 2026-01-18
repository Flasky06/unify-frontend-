import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { businessService } from "../../services/businessService";
import { shopService } from "../../services/shopService";
import useAuthStore from "../../store/authStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";

const OnboardingWizard = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuthStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form data state
    const [businessData, setBusinessData] = useState({
        businessName: "",
        businessType: "",
        address: "",
    });

    const [shopCount, setShopCount] = useState(1);
    const [shopsData, setShopsData] = useState([
        { shopName: "" },
    ]);

    // Load saved progress from sessionStorage
    useEffect(() => {
        const savedProgress = sessionStorage.getItem("onboarding-progress");
        if (savedProgress) {
            try {
                const data = JSON.parse(savedProgress);
                setCurrentStep(data.currentStep || 1);
                setBusinessData(data.businessData || businessData);
                setShopCount(data.shopCount || 1);
                setShopsData(data.shopsData || shopsData);
            } catch (err) {
                console.error("Failed to load onboarding progress:", err);
            }
        }
    }, []);

    // Save progress to sessionStorage
    useEffect(() => {
        const progress = {
            currentStep,
            businessData,
            shopCount,
            shopsData,
        };
        sessionStorage.setItem("onboarding-progress", JSON.stringify(progress));
    }, [currentStep, businessData, shopCount, shopsData]);

    // Update shops array when count changes
    const handleShopCountChange = (count) => {
        const newCount = parseInt(count) || 1;
        setShopCount(newCount);

        // Adjust shops array
        const newShops = [...shopsData];
        if (newCount > shopsData.length) {
            // Add new empty shops
            for (let i = shopsData.length; i < newCount; i++) {
                newShops.push({ shopName: "" });
            }
        } else if (newCount < shopsData.length) {
            // Remove excess shops
            newShops.splice(newCount);
        }
        setShopsData(newShops);
    };

    const handleShopDataChange = (index, field, value) => {
        const newShops = [...shopsData];
        newShops[index][field] = value;
        setShopsData(newShops);
    };

    const validateStep = () => {
        setError(null);

        switch (currentStep) {
            case 1: // Business Details
                if (!businessData.businessName.trim()) {
                    setError("Business name is required");
                    return false;
                }
                if (!businessData.businessType.trim()) {
                    setError("Business type is required");
                    return false;
                }
                return true;

            case 2: // Shop Count & Details
                if (shopCount < 1 || shopCount > 10) {
                    setError("Please select between 1 and 10 shops");
                    return false;
                }
                for (let i = 0; i < shopsData.length; i++) {
                    if (!shopsData[i].shopName.trim()) {
                        setError(`Shop ${i + 1} name is required`);
                        return false;
                    }
                }
                return true;

            default:
                return true;
        }
    };

    const handleNext = async () => {
        if (!validateStep()) return;

        if (currentStep === 2) {
            // Final step - submit all data
            await handleSubmit();
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            // Step 1: Create business
            const business = await businessService.createBusiness({
                ...businessData,
                shopLimit: shopCount,
                preferredPlan: sessionStorage.getItem("preferredPlan") || "",
            });

            // Step 2: Create shops
            const shopPromises = shopsData.map((shop) =>
                shopService.create({
                    name: shop.shopName,
                })
            );

            await Promise.all(shopPromises);

            // Update user state
            if (user) {
                updateUser({ ...user, businessId: business.id });
            }

            // Clear saved progress
            sessionStorage.removeItem("onboarding-progress");

            // Move to success step
            setCurrentStep(3);
        } catch (err) {
            console.error("Onboarding submission failed:", err);
            setError(err.message || "Failed to complete setup. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoToDashboard = () => {
        navigate("/dashboard");
    };

    const totalSteps = 3;
    const progressPercentage = (currentStep / totalSteps) * 100;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-8">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Progress Bar */}
                <div className="bg-gray-100 h-2">
                    <div
                        className="bg-blue-600 h-2 transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                <div className="p-8">
                    {/* Step Indicator */}
                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-500 font-medium">
                            Step {currentStep} of {totalSteps}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Business Details */}
                    {currentStep === 1 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Business Details
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Tell us about your business
                            </p>

                            <div className="space-y-3">
                                <Input
                                    label="Business Name"
                                    value={businessData.businessName}
                                    onChange={(e) =>
                                        setBusinessData({
                                            ...businessData,
                                            businessName: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., ABC Retail Store"
                                    required
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
                                    placeholder="e.g., Retail, Electronics, Pharmacy"
                                    required
                                />

                                <Input
                                    label="Business Address"
                                    value={businessData.address}
                                    onChange={(e) =>
                                        setBusinessData({
                                            ...businessData,
                                            address: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Nairobi, Kenya"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Shop Setup */}
                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Shop Setup
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Configure your shops or branches
                            </p>

                            <div className="mb-4">
                                <Select
                                    label="Number of Shops/Branches"
                                    value={shopCount.toString()}
                                    onChange={(e) => handleShopCountChange(e.target.value)}
                                    required
                                >
                                    <option value="1">1 Shop</option>
                                    <option value="2">2 Shops</option>
                                    <option value="3">3 Shops</option>
                                    <option value="4">4 Shops</option>
                                    <option value="5">5 Shops</option>
                                    <option value="6">6 Shops</option>
                                    <option value="7">7 Shops</option>
                                    <option value="8">8 Shops</option>
                                    <option value="9">9 Shops</option>
                                    <option value="10">10 Shops</option>
                                </Select>
                            </div>

                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                                {shopsData.map((shop, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                    >
                                        <Input
                                            label={`Shop ${index + 1} Name`}
                                            value={shop.shopName}
                                            onChange={(e) =>
                                                handleShopDataChange(
                                                    index,
                                                    "shopName",
                                                    e.target.value
                                                )
                                            }
                                            placeholder={`e.g., ${businessData.businessName || 'Main'} Branch`}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {currentStep === 3 && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="w-10 h-10 text-green-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                All Set! 🎉
                            </h1>
                            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                                Your business is ready to go. You can now start managing your
                                inventory, sales, and more.
                            </p>

                            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    What's been set up:
                                </h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <svg
                                            className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <span>
                                            <strong>{businessData.businessName}</strong> business
                                            account
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg
                                            className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <span>
                                            {shopCount} {shopCount === 1 ? "shop" : "shops"} created
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg
                                            className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <span>Trial subscription activated</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                        {currentStep > 1 && currentStep < 3 && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={loading}
                            >
                                Back
                            </Button>
                        )}

                        {currentStep < 3 && (
                            <Button
                                onClick={handleNext}
                                disabled={loading}
                                className="ml-auto"
                            >
                                {loading
                                    ? "Processing..."
                                    : currentStep === 2
                                        ? "Complete Setup"
                                        : "Next"}
                            </Button>
                        )}

                        {currentStep === 3 && (
                            <Button onClick={handleGoToDashboard} className="mx-auto">
                                Go to Dashboard
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
