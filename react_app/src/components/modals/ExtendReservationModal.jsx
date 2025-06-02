import React, { useState } from "react";
import { extendReservation } from "../../services/reservationApi";

const ExtendReservationModal = ({
  isOpen,
  onClose,
  onConfirm,
  reservation,
}) => {
  const [days, setDays] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (days < 1) {
      setError("Please enter at least 1 day");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log(`Extending reservation by ${days} days`);

      // If we have an actual reservation ID, call the API
      if (reservation && reservation.id) {
        await extendReservation(reservation.id, days);
      }

      // Call the onConfirm handler regardless to update the UI
      onConfirm(days);
    } catch (err) {
      setError(err.message || "Failed to extend reservation");
      console.error("Failed to extend reservation:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Extend Reservation
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500 mb-4">
              {reservation ? (
                <>
                  Extend the reservation deadline for{" "}
                  <span className="font-medium">{reservation.bookTitle}</span>{" "}
                  by{" "}
                  <span className="font-medium">{reservation.studentName}</span>
                  .
                </>
              ) : (
                "Extend the reservation deadline."
              )}
            </p>

            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-left text-gray-700 text-sm font-bold mb-2"
                  htmlFor="days"
                >
                  Number of Days
                </label>
                <input
                  id="days"
                  type="number"
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value, 10) || 0)}
                  min="1"
                  max="90"
                />
              </div>
              <div className="flex items-center justify-between mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 ${
                    isSubmitting
                      ? "bg-blue-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white rounded-md focus:outline-none flex items-center justify-center min-w-[80px]`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing
                    </>
                  ) : (
                    "Extend"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtendReservationModal;
