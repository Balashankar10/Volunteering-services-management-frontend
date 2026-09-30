import React, { useState, useEffect } from 'react';
import Axios from 'axios';

const Userpr = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token
        const response = await Axios.get("http://localhost:5000/api/user-pending-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setPendingRequests(response.data);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Your Pending Service Requests</h2>
      {pendingRequests.length === 0 ? (
        <p>No pending requests found.</p>
      ) : (
        pendingRequests.map(request => {
          const { fullHomeAddress = {}, providerEmail, emergencyContact, currentTime } = request;
          const { street, city, zipCode } = fullHomeAddress;

          return (
            <div key={request._id} style={{ borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
              <h3>Service Provider: {providerEmail}</h3>
              <p><strong>Requested Date:</strong> {request.date}</p>
              <p><strong>Requested Time:</strong> {request.time}</p>
              
              {emergencyContact && <p><strong>Emergency Contact:</strong> Yes</p>}
              
              {street && <p><strong>Street:</strong> {street}</p>}
              {city && <p><strong>City:</strong> {city}</p>}
              {zipCode && <p><strong>Zip Code:</strong> {zipCode}</p>}
              
              {/* Display current time and date as the last item */}
              <p><strong>Time and Date of Request:</strong> {new Date(currentTime).toLocaleString()}</p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Userpr;
