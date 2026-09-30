import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";
import Rating from "../components/Rating"; // Make sure the path matches your folder structure

function UserDashboard() {
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [providers, setProviders] = useState([]);
    const [ratings, setRatings] = useState({});
    const [message, setMessage] = useState("");
    const [openReviews, setOpenReviews] = useState({});
    const navigate = useNavigate();

    // Fetch cities on component mount
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const { data } = await axios.get("http://localhost:5000/cities");
                setCities(data.map(city => city.charAt(0).toUpperCase() + city.slice(1)));
            } catch (err) {
                setMessage("❌ Error fetching cities.");
            }
        };
        fetchCities();
    }, []);

    // Fetch providers by selected city
    const handleCityChange = async (e) => {
        const city = e.target.value;
        setSelectedCity(city);

        if (city) {
            try {
                const { data } = await axios.get(`http://localhost:5000/providers/${city}`);
                setProviders(data);
            } catch (err) {
                console.error("❌ Error fetching providers:", err);
                setMessage("❌ Error fetching providers.");
            }
        } else {
            setProviders([]);
        }
    };

    // Fetch average ratings for each provider
    const fetchRatings = async (email) => {
        try {
            const { data } = await axios.get(`http://localhost:5000/ratings/${email}`);
            setRatings(prevRatings => ({
                ...prevRatings,
                [email]: data
            }));
        } catch (err) {
            console.error("❌ Error fetching ratings:", err);
        }
    };

    // Toggle review visibility
    const toggleReviews = (email) => {
        setOpenReviews(prevState => ({
            ...prevState,
            [email]: !prevState[email]
        }));
    };

    // Request service from a provider
    const handleRequestService = (provider) => {
        navigate(`/request-service/${provider._id}`, {
            state: { providerEmail: provider.email }
        });
    };

    // Fetch ratings when providers change
    useEffect(() => {
        providers.forEach(provider => {
            fetchRatings(provider.email);
        });
    }, [providers]);

    return (
        <div className="dashboard-container">
            <h2 className="title">Welcome to User Dashboard</h2>

            {/* Request Status Buttons */}
            <div className="request-status-buttons">
                <button className="status-button" onClick={() => navigate("/accepted-requests")}>
                    Accepted Requests
                </button>
                <button className="status-button" onClick={() => navigate("/rejected-requests")}>
                    Rejected Requests
                </button>
                <button className="status-button" onClick={() => navigate("/userpr")}>
                    Pending Requests
                </button>
            </div>

            {/* City Selection */}
            <label className="label">Select your city:</label>
            <select className="dropdown" value={selectedCity} onChange={handleCityChange}>
                <option value="">-- Select City --</option>
                {cities.length > 0 ? (
                    cities.map((city, index) => (
                        <option key={index} value={city}>{city}</option>
                    ))
                ) : (
                    <option disabled>Loading cities...</option>
                )}
            </select>

            {/* Providers List */}
            {providers.length > 0 ? (
                <div className="provider-list">
                    <h3 className="sub-title">Service Providers in {selectedCity}</h3><br />
                    {providers.map((provider, index) => (
                        <div key={index} className="provider-card">
                            <div className="provider-details">
                                <p><strong>Name:</strong> {provider.name || "N/A"}</p>
                                <p><strong>Service:</strong> {provider.service || "N/A"}</p>
                                <p><strong>Age:</strong> {provider.age || "N/A"}</p>
                                <p><strong>City:</strong> {provider.city || "N/A"}</p>

                                {/* Average rating display as stars and value */}
                                {ratings[provider.email] && (
                                    <div>
                                        <p><strong>Average Rating:</strong> 
                                            {ratings[provider.email].average} <Rating rating={ratings[provider.email].average} />
                                        </p>
                                        <button onClick={() => toggleReviews(provider.email)}>
                                            {openReviews[provider.email] ? "Close Reviews" : "Open Reviews"}
                                        </button>
                                        {openReviews[provider.email] && (
                                            <div className="reviews">
                                                {ratings[provider.email].reviews.map((review, idx) => (
                                                    <div key={idx} className="review">
                                                        <p><strong>{review.userEmail}:</strong> {review.rating} <Rating rating={review.rating} /></p>
                                                        <p>{review.review}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    className="request-button"
                                    onClick={() => handleRequestService(provider)}
                                >
                                    Request
                                </button>
                            </div>
                            {provider.photo ? (
                                <img 
                                    src={provider.photo}
                                    alt={provider.name}
                                    className="provider-photo"
                                />
                            ) : (
                                <p>No photo available</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                selectedCity && <p className="no-providers">No providers available in this city.</p>
            )}

            {message && <p className="error-message">{message}</p>}
        </div>
    );
}

export default UserDashboard;
