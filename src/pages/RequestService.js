import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import './RequestService.css';

function RequestService() {
    const { providerId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [providerEmail, setProviderEmail] = useState(location.state?.providerEmail || "");
    const [userEmail, setUserEmail] = useState("");
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [dob, setDob] = useState("");

    // Full Home Address split fields
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [specificInstructions, setSpecificInstructions] = useState("");

    const [phoneNumber, setPhoneNumber] = useState("");
    const [landmarkDescription, setLandmarkDescription] = useState("");
    const [emergencyContact, setEmergencyContact] = useState(false);
    const [currentLocation, setCurrentLocation] = useState("");
    const [message, setMessage] = useState("");
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        if (loggedInUser) {
            setUserEmail(loggedInUser.email);
        }

        if (!providerEmail && providerId) {
            const fetchProviderEmail = async () => {
                try {
                    const { data } = await axios.get(`http://localhost:5000/provider/${providerId}`);
                    setProviderEmail(data.email);
                } catch (err) {
                    console.error("Error fetching provider email:", err);
                }
            };
            fetchProviderEmail();
        }

        setCurrentTime(new Date().toISOString());
    }, [providerId, providerEmail]);

    const handleSendLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setCurrentLocation(`https://www.google.com/maps?q=${lat},${lng}`);
            }, () => {
                setMessage("❌ Location access denied.");
            });
        } else {
            setMessage("❌ Geolocation is not supported.");
        }
    };

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        const today = new Date().toISOString().split("T")[0];

        if (selectedDate < today) {
            setMessage("❌ Date of service cannot be in the past.");
            setDate("");
        } else {
            setMessage("");
            setDate(selectedDate);
        }
    };

    const handleTimeChange = (e) => {
        const selectedTime = e.target.value;
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);

        if (date === new Date().toISOString().split("T")[0] && selectedTime < currentTime) {
            setMessage("❌ Preferred time cannot be in the past.");
            setTime("");
        } else {
            setMessage("");
            setTime(selectedTime);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");

            const fullHomeAddress = {
                street,
                city,
                zipCode,
                specificInstructions
            };

            await axios.post(
                "http://localhost:5000/request-service",
                {
                    providerEmail,
                    userEmail,
                    name,
                    date,
                    time,
                    dob,
                    fullHomeAddress,
                    phoneNumber,
                    landmarkDescription,
                    emergencyContact,
                    currentLocation,
                    currentTime
                },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            setMessage("✅ Request sent successfully!");
            setTimeout(() => navigate("/user-dashboard"), 1500);
        } catch (err) {
            console.error("❌ Error submitting request:", err);
            setMessage("❌ Error submitting request.");
        }
    };

    return (
        <div className="request-service-container">
            <div className="request-form-card">
                <h2>Request Service</h2>
                <form onSubmit={handleSubmit}>
                    <label>Provider Email:</label>
                    <input type="email" value={providerEmail} readOnly />

                    <label>Your Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

                    <label>Date of Service:</label>
                    <input type="date" value={date} onChange={handleDateChange} required />

                    <label>Preferred Time:</label>
                    <input type="time" value={time} onChange={handleTimeChange} required />

                    <label>Date of Birth:</label>
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />

                    <label>House number and Street:</label>
                    <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} required />

                    <label>City:</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required />

                    <label>Zip Code:</label>
                    <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />

                    <label>Specific Instructions:</label>
                    <input type="text" value={specificInstructions} onChange={(e) => setSpecificInstructions(e.target.value)} />

                    <label>Phone Number:</label>
                    <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />

                    <label>Landmark/Description (optional):</label>
                    <input type="text" value={landmarkDescription} onChange={(e) => setLandmarkDescription(e.target.value)} />

                    <label>Emergency Contact:</label>
                    <input type="checkbox" checked={emergencyContact} onChange={(e) => setEmergencyContact(e.target.checked)} />

                    <button type="button" onClick={handleSendLocation}>Send Current Location</button>

                    {currentLocation && (
                        <p><strong>Current Location:</strong> <a href={currentLocation} target="_blank" rel="noopener noreferrer">View on Google Maps</a></p>
                    )}

                    <button type="submit">Submit Request</button>
                </form>
                <p>{message}</p>
            </div>
        </div>
    );
}

export default RequestService;
