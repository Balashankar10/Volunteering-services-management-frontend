import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./EditServiceDetails.css";

function EditServiceDetails() {
    const [name, setName] = useState("");
    const [service, setService] = useState("");
    const [age, setAge] = useState("");
    const [city, setCity] = useState("");
    const [upiId, setUpiId] = useState("");
    const [photo, setPhoto] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const API_URL = process.env.REACT_APP_API_URL;
    const CLOUD_NAME = process.env.REACT_APP_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.REACT_APP_UPLOAD_PRESET;

    useEffect(() => {
        const fetchDetails = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setMessage("❌ Authentication failed. Please log in again.");
                return;
            }

            try {
                const { data } = await axios.get(`${API_URL}/provider/details`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (data) {
                    setName(data.name || "");
                    setService(data.service || "");
                    setAge(data.age || "");
                    setCity(data.city || "");
                    setUpiId(data.upiId || "");
                }
            } catch (err) {
                console.error("Error fetching provider details:", err);
            }
        };

        fetchDetails();
    }, [API_URL]);

    const uploadImageToCloudinary = async (file) => {
        if (!file) return "";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                formData
            );
            return res.data.secure_url;
        } catch (error) {
            console.error("Image upload error:", error);
            return "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        if (!token) {
            setMessage("❌ Authentication failed. Please log in again.");
            return;
        }

        try {
            const photoUrl = photo ? await uploadImageToCloudinary(photo) : "";
            const qrCodeUrl = qrCode ? await uploadImageToCloudinary(qrCode) : "";

            await axios.post(
                `${API_URL}/provider/details`,
                {
                    name,
                    service,
                    age,
                    city,
                    upiId,
                    photo: photoUrl,
                    qrCode: qrCodeUrl,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setMessage("✅ Details updated successfully!");
            setTimeout(() => navigate("/provider-dashboard"), 1000);
        } catch (err) {
            console.error("❌ Update Error:", err);
            setMessage(err.response?.data?.message || "❌ Error updating details.");
        }
    };

    return (
        <div className="edit-service-container">
            <h2>Edit Service Details</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Service:</label>
                    <input
                        type="text"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Age:</label>
                    <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>City:</label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>UPI ID:</label>
                    <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Upload Profile Photo:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhoto(e.target.files[0])}
                    />
                </div>

                <div className="form-group">
                    <label>Upload QR Code:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setQrCode(e.target.files[0])}
                    />
                </div>

                <button type="submit">Save Details</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
}

export default EditServiceDetails;
