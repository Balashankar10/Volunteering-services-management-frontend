import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProviderDashboard.css"; // Import external CSS

function ProviderDashboard() {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDetails = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setMessage("❌ Authentication failed. Please log in again.");
                setLoading(false);
                return;
            }

            try {
                const { data } = await axios.get("http://localhost:5000/provider/details", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setDetails(data);
            } catch (err) {
                if (err.response?.status === 404) {
                    setDetails(null);
                } else {
                    setMessage("❌ Error fetching details.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, []);

    if (loading) return <h2 className="loading-text">Loading...</h2>;

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Welcome to Provider Dashboard</h2>

            {details ? (
                <div className="service-card">
                    <h3 className="service-title">Your Service Details</h3>

                    {details.photo && (
                        <img src={details.photo} alt="Provider" className="provider-photo" />
                    )}

                    <p><strong>Name:</strong> {details.name}</p>
                    <p><strong>Service:</strong> {details.service}</p>
                    <p><strong>Age:</strong> {details.age}</p>
                    <p><strong>City:</strong> {details.city}</p>

                    {details.upiId && (
                        <p><strong>UPI ID:</strong> {details.upiId}</p>
                    )}

                    {details.qrCode && (
                        <div>
                            <strong>QR Code:</strong>
                            <br />
                            <img src={details.qrCode} alt="QR Code" className="qr-code-img" />
                        </div>
                    )}

                    <button onClick={() => navigate("/edit-service-details")} className="btn edit-btn">
                        Edit Details
                    </button>
                </div>
            ) : (
                <div className="service-card">
                    <p>No service details updated</p>
                    <button onClick={() => navigate("/edit-service-details")} className="btn update-btn">
                        Update Service Details
                    </button>
                </div>
            )}

            <button onClick={() => navigate("/pending-requests")} className="btn pending-btn">
                Pending Requests
            </button>

            <button onClick={() => navigate("/accepted-orders")} className="btn accepted-orders-btn">
                Accepted Orders
            </button>

            {message && <p className="error-message">{message}</p>}
        </div>
    );
}

export default ProviderDashboard;
