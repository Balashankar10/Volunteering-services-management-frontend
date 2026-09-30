import { useState, useEffect } from "react";
import axios from "axios";
import "./PendingRequests.css";

function PendingRequests() {
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5000/provider/pending-requests", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.message) {
                    setMessage(response.data.message);
                } else {
                    // Sort: emergency true first, then by most recent currentTime
                    const sortedRequests = [...response.data].sort((a, b) => {
                        if (a.emergencyContact && !b.emergencyContact) return -1;
                        if (!a.emergencyContact && b.emergencyContact) return 1;
                        return new Date(b.currentTime) - new Date(a.currentTime);
                    });

                    setRequests(sortedRequests);
                }
            } catch (err) {
                console.error("Error fetching requests:", err);
                setMessage("Unauthorized access.");
            }
        };

        fetchRequests();
    }, []);

    const handleAction = async (requestId, action) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:5000/provider/handle-request`,
                { requestId, action },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setRequests((prev) => prev.filter((req) => req._id !== requestId));
        } catch (err) {
            console.error(`Error handling request (${action}):`, err);
            setMessage("Error processing request.");
        }
    };

    return (
        <div className="pending-requests-container">
            <div className="pending-box">
                <h2>Pending Service Requests</h2>
                {message ? (
                    <p>{message}</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {requests.map((req) => {
                            const reqTime = new Date(req.currentTime);
                            const formattedDate = reqTime.toLocaleDateString();
                            const formattedTime = reqTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            return (
                                <li key={req._id} className="request-item">
                                    <strong>Name:</strong> {req.name}<br />
                                    <strong>Requested Date:</strong> {req.date}<br />
                                    <strong>Requested Time:</strong> {req.time}<br />
                                    <strong>Date of Birth:</strong> {req.dob}<br />
                                    <strong>Phone Number:</strong> {req.phoneNumber}<br />
                                    <strong>Address:</strong><br />
                                    <div style={{ paddingLeft: "10px", lineHeight: "1.6" }}>
                                        <div><strong>House number and Street:</strong> {req.fullHomeAddress?.street}</div>
                                        <div><strong>City:</strong> {req.fullHomeAddress?.city}</div>
                                        <div><strong>Zip Code:</strong> {req.fullHomeAddress?.zipCode}</div>
                                        {req.fullHomeAddress?.specificInstructions && (
                                            <div><strong>Instructions:</strong> {req.fullHomeAddress.specificInstructions}</div>
                                        )}
                                    </div>

                                    {req.landmarkDescription && (
                                        <>
                                            <strong>Landmark/Description:</strong> {req.landmarkDescription}<br />
                                        </>
                                    )}
                                    <strong>User Email:</strong> {req.userEmail}<br />
                                    {req.emergencyContact && (
                                        <strong style={{ color: "red" }}>🚨 Emergency Contact</strong>
                                    )}
                                    <div className="request-actions" style={{ marginTop: "8px" }}>
                                        {req.currentLocation && (
                                            <button
                                                className="view-location-btn"
                                                onClick={() => window.open(req.currentLocation, "_blank")}
                                            >
                                                📍 View Location
                                            </button>
                                        )}
                                        <button
                                            className="accept-btn"
                                            onClick={() => handleAction(req._id, "accept")}
                                        >
                                            ✅ Accept
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => handleAction(req._id, "reject")}
                                        >
                                            ❌ Reject
                                        </button>
                                    </div>
                                    <div style={{ marginTop: "8px" }}>
                                        <strong>Time of Request:</strong> {formattedTime} |{" "}
                                        <strong>Date of Request:</strong> {formattedDate}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default PendingRequests;
