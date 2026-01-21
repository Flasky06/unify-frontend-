import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { shopService } from "../services/shopService";

/**
 * OnboardingGuard - Ensures users complete onboarding before accessing the app
 * Checks if user has business and at least one shop
 */
const OnboardingGuard = ({ children }) => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [hasShops, setHasShops] = useState(false);

    useEffect(() => {
        const checkOnboardingStatus = async () => {
            try {
                // Check if user has shops
                const shops = await shopService.getAll();
                setHasShops(shops && shops.length > 0);
            } catch (error) {
                console.error("Failed to check onboarding status:", error);
                setHasShops(false);
            } finally {
                setLoading(false);
            }
        };

        checkOnboardingStatus();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Only business owners need to complete onboarding
    // Super admins, business managers, shop managers, and sales reps bypass onboarding
    if (user?.role !== "BUSINESS_OWNER") {
        return children;
    }

    // Check if business owner has business (businessId or business object)
    const hasBusiness = user?.businessId || user?.business?.id;

    // If business owner doesn't have business or shops, redirect to onboarding
    if (!hasBusiness || !hasShops) {
        return <Navigate to="/onboarding" replace />;
    }

    // Business owner has completed onboarding, allow access
    return children;
};

export default OnboardingGuard;
