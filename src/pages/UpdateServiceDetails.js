import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UpdateServiceDetails.css";

function UpdateServiceDetails() {
    const [name, setName] = useState("");
    const [service, setService] = useState("");
    const [city, setCity] = useState("");
    const [age, setAge] = useState("");
    const [upiId, setUpiId] = useState("");
    const [photo, setPhoto] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const uploadImageToCloudinary = async (imageFile) => {
        const data = new FormData();
        data.append("file", imageFile);
        data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
        data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);

        try {
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
                data
            );
            return res.data.secure_url;
        } catch (err) {
            console.error("Image upload failed:", err);
            throw new Error("Image upload failed");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("Authentication failed. Please log in again.");
            return;
        }

        try {
            let photoUrl = "";
            let qrCodeUrl = "";

            if (photo) photoUrl = await uploadImageToCloudinary(photo);
            if (qrCode) qrCodeUrl = await uploadImageToCloudinary(qrCode);

            await axios.post(
                "http://localhost:5000/provider/details",
                {
                    name,
                    service,
                    city,
                    age,
                    photo: photoUrl,
                    upiId,
                    qrCode: qrCodeUrl,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage("Details updated successfully!");
            setTimeout(() => navigate("/provider-dashboard"), 1000);
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || "Error updating details.");
        }
    };

    return (
        <div className="update-container">
            <div className="update-form-card">
                <h2>Update Service Details</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Service"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="UPI ID"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                    />
                    <label>Upload Profile Photo:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhoto(e.target.files[0])}
                        required
                    />
                    <label>Upload QR Code:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setQrCode(e.target.files[0])}
                        required
                    />
                    <button type="submit">Save Details</button>
                </form>
                <p>{message}</p>
            </div>
        </div>
    );
}

export default UpdateServiceDetails;
