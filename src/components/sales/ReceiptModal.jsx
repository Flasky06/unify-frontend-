import { format } from "date-fns";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { useState } from "react";

const ReceiptModal = ({ isOpen, onClose, sale, onPay, onVoid }) => {
    if (!sale) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                sale.status === "PENDING"
                    ? "Invoice Details"
                    : "Sale Receipt"
            }
        >
            <div
                id="printable-receipt"
                className="print:w-[80mm] print:mx-auto print:font-mono print:text-xs"
            >
                {/* Receipt Header */}
                <div className="text-center pb-4 border-b-2 border-dashed border-gray-300 mb-4 print:pb-2 print:mb-2">
                    <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                        {sale.businessName}
                    </h1>
                    <h2 className="text-sm font-semibold text-gray-700">
                        {sale.shopName}
                    </h2>

                    <div className="mt-3 flex flex-col gap-0.5 text-sm text-gray-600">
                        <p>
                            <span className="font-semibold">Receipt #:</span>{" "}
                            {sale.saleNumber}
                        </p>
                        <p>
                            {format(
                                new Date(sale.saleDate),
                                "MMM d, yyyy, h:mm a"
                            )}
                        </p>
                    </div>
                </div>

                {/* Status & Payment Info */}
                <div className="flex justify-between text-sm mb-4 border-b border-gray-100 pb-2 print:border-none print:mb-2 print:pb-0">
                    <div>
                        <span className="text-gray-500 text-xs uppercase block">
                            Payment
                        </span>
                        <span className="font-semibold text-gray-900">
                            {sale.paymentMethod
                                ? sale.paymentMethod.replace("_", " ")
                                : "CASH"}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-gray-500 text-xs uppercase block">
                            Status
                        </span>
                        <span className="font-bold text-gray-900">
                            {sale.status}
                        </span>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-sm mb-4">
                    <thead>
                        <tr className="border-b border-gray-900">
                            <th className="py-1 text-left w-[55%]">Product</th>
                            <th className="py-1 text-center w-[15%]">Qty</th>
                            <th className="py-1 text-right w-[30%]">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-gray-200">
                        {sale.items?.map((item, idx) => {
                            const itemTotal =
                                (item.finalPrice || item.unitPrice) * item.quantity;
                            return (
                                <tr key={idx} className="print:leading-tight">
                                    <td className="py-2 pr-1 align-top">
                                        <div className="font-medium text-gray-900">
                                            {item.productName || item.serviceName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            @ KSH{" "}
                                            {(
                                                item.finalPrice || item.unitPrice
                                            ).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="py-2 text-center align-top font-medium">
                                        {item.quantity}
                                    </td>
                                    <td className="py-2 text-right align-top font-bold text-gray-900">
                                        {itemTotal.toLocaleString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Totals Section */}
                <div className="border-t-2 border-gray-900 pt-3 space-y-1 text-sm border-dashed">
                    {(() => {
                        const subtotal =
                            sale.items?.reduce(
                                (sum, item) => sum + item.unitPrice * item.quantity,
                                0
                            ) || 0;
                        const totalDiscount = sale.discountAmount || 0;

                        return (
                            <>
                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>KSH {subtotal.toLocaleString()}</span>
                                    </div>
                                )}

                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-gray-600 print:font-bold">
                                        <span>Sale Discount</span>
                                        <span>- KSH {totalDiscount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-base font-bold text-gray-900 pt-2 border-t border-gray-300 mt-2">
                                    <span className="uppercase">Grand Total</span>
                                    <span>KSH {sale.total.toLocaleString()}</span>
                                </div>
                            </>
                        );
                    })()}
                </div>

                {/* Footer */}
                <div className="text-center pt-8 border-t-2 border-dashed border-gray-200 mt-6 print:mt-4 print:pt-4">
                    <p className="font-bold text-gray-900 mb-1">
                        Thank you for your business!
                    </p>
                    <p className="text-xs text-gray-500">
                        This receipt serves as proof of purchase.
                    </p>
                </div>
            </div>

            {/* Actions - HIDDEN ON PRINT */}
            <div className="flex justify-between pt-6 border-t border-gray-100 print:hidden">
                <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="gap-2"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                    </svg>
                    Print{" "}
                    {sale.status === "PENDING" ? "Invoice" : "Receipt"}
                </Button>

                <div className="flex gap-2">
                    {sale.status === "PENDING" && onPay && (
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => onPay(sale)}
                        >
                            Pay
                        </Button>
                    )}
                    {sale.status !== "CANCELLED" && onVoid && (
                        <Button
                            variant="outline"
                            onClick={() => onVoid(sale)}
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                            Cancel Sale
                        </Button>
                    )}
                    <Button onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ReceiptModal;
