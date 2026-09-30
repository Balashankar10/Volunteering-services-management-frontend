import { useEffect, useState } from "react";
import axios from "axios";
import "./AcceptedOrders.css";

function AcceptedOrders() {
    const [acceptedOrders, setAcceptedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [orderToComplete, setOrderToComplete] = useState(null);
    const [confirmation, setConfirmation] = useState("");
    const [fees, setFees] = useState({});
    const [isEditingFee, setIsEditingFee] = useState({});

    useEffect(() => {
        const fetchAcceptedOrders = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await axios.get("http://localhost:5000/acceptedrequests", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setAcceptedOrders(data);

                // Initialize fees state with existing values if needed
                const feeMap = {};
                data.forEach(order => {
                    if (order.providerFee !== undefined) {
                        feeMap[order._id] = order.providerFee;
                    }
                });
                setFees(feeMap);
            } catch (err) {
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };

        fetchAcceptedOrders();
    }, []);

    const handleConfirmCompletion = async (orderId) => {
        if (confirmation === "CONFIRM") {
            try {
                await axios.put(`http://localhost:5000/complete-request/${orderId}`, {
                    confirmation: confirmation
                });

                setAcceptedOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === orderId ? { ...order, completion: 1 } : order
                    )
                );

                setShowPopup(false);
                setConfirmation("");
            } catch (err) {}
        }
    };

    const handleFeeChange = (orderId, value) => {
        setFees(prev => ({ ...prev, [orderId]: value }));
    };

    const handleFeeSubmit = async (orderId) => {
        const token = localStorage.getItem("token");
        const providerFeeValue = fees[orderId];

        if (!providerFeeValue || isNaN(providerFeeValue)) {
            return;
        }

        const feeValue = providerFeeValue * 1.1; // Calculating the fee as 110% of providerFee

        try {
            await axios.put(`http://localhost:5000/acceptedrequests/providerfee/${orderId}`,
                { providerFee: Number(providerFeeValue), fee: Number(feeValue) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setIsEditingFee(prev => ({ ...prev, [orderId]: false }));
        } catch (error) {}
    };

    const handleEditFee = (orderId) => {
        setIsEditingFee(prev => ({ ...prev, [orderId]: true }));
    };

    if (loading) return <h2 className="loading-text">Loading...</h2>;

    return (
        <div className="orders-container">
            <h2 className="page-title">Your Accepted Orders</h2>

            {acceptedOrders.length === 0 ? (
                <p className="no-orders">No accepted orders yet.</p>
            ) : (
                <div className="orders-list">
                    {acceptedOrders.map((order, index) => (
                        <div key={index} className="order-card">
                            <div className="order-content">
                                <p><strong>Name:</strong> {order.name}</p>
                                <p><strong>Email:</strong> {order.userEmail}</p>
                                <p><strong>Requested Date:</strong> {order.date}</p>
                                <p><strong>Requested Time:</strong> {order.time}</p>
                                <p><strong>Phone Number:</strong> {order.phoneNumber}</p>
                                <p><strong>Status:</strong> {order.status}</p>

                                <div className="address-section">
                                    <p><strong>Street:</strong> {order.fullHomeAddress?.street || "N/A"}</p>
                                    <p><strong>City:</strong> {order.fullHomeAddress?.city || "N/A"}</p>
                                    <p><strong>Zip Code:</strong> {order.fullHomeAddress?.zipCode || "N/A"}</p>
                                    {order.fullHomeAddress?.specificInstructions && (
                                        <p><strong>Specific Instructions:</strong> {order.fullHomeAddress.specificInstructions}</p>
                                    )}
                                    {order.fullHomeAddress?.landmarkDescription && (
                                        <p><strong>Landmark:</strong> {order.fullHomeAddress.landmarkDescription}</p>
                                    )}
                                </div>

                                {order.emergencyContact && (
                                    <p className="emergency-text">🚨 Emergency Contact Needed</p>
                                )}

                                {order.currentLocation && (
                                    <button 
                                        className="location-btn"
                                        onClick={() => window.open(order.currentLocation, "_blank")}
                                    >
                                        📍 View Location
                                    </button>
                                )}

                                {order.completion === null && (
                                    <button
                                        className="confirm-completion-btn"
                                        onClick={() => {
                                            setOrderToComplete(order);
                                            setShowPopup(true);
                                        }}
                                    >
                                        Confirm Completion
                                    </button>
                                )}

                                {order.completion > 0 && (
                                    <div className="payment-pending">
                                        Payment Pending

                                        <div className="fee-input-section">
                                            {isEditingFee[order._id] ? (
                                                <>
                                                    <input
                                                        type="number"
                                                        placeholder="Enter Provider Fee"
                                                        value={fees[order._id] || ""}
                                                        onChange={(e) => handleFeeChange(order._id, e.target.value)}
                                                        className="fee-input"
                                                    />
                                                    <button
                                                        onClick={() => handleFeeSubmit(order._id)}
                                                        className="submit-fee-btn"
                                                    >
                                                        Submit Fee
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <p><strong>Provider Fee: </strong>{fees[order._id] || "Not Set"}</p>
                                                    <button
                                                        onClick={() => handleEditFee(order._id)}
                                                        className="edit-fee-btn"
                                                    >
                                                        Edit Fee
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="order-time">
                                {new Date(order.currentTime).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Confirm Completion</h3>
                        <p>Please type "CONFIRM" to complete the request:</p>
                        <input
                            type="text"
                            value={confirmation}
                            onChange={(e) => setConfirmation(e.target.value)}
                            className="confirmation-input"
                        />
                        <button
                            className="confirm-btn"
                            onClick={() => handleConfirmCompletion(orderToComplete._id)}
                        >
                            Confirm
                        </button>
                        <button
                            className="cancel-btn"
                            onClick={() => setShowPopup(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AcceptedOrders;
