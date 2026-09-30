import React, { useState, useEffect } from 'react';
import Axios from 'axios';

const UserRejectedRequests = () => {
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token"); // 👈 Get JWT from local storage
        const response = await Axios.get("http://localhost:5000/api/rejected-requests", {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
        setRejectedRequests(response.data);
      } catch (error) {
        console.error("Error fetching rejected requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Rejected Service Requests</h2>
      {rejectedRequests.length === 0 ? (
        <p>No rejected requests found.</p>
      ) : (
        rejectedRequests.map(request => {
          const { fullHomeAddress = {} } = request;
          const { street, city, zipCode, specificInstructions } = fullHomeAddress;

          return (
            <div key={request._id} style={{ borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
              <h3>{request.name}</h3>
              <p>{request.date} at {request.time}</p>
              <p>Phone: {request.phoneNumber}</p>
              {street && <p>Street: {street}</p>}
              {city && <p>City: {city}</p>}
              {zipCode && <p>Zip Code: {zipCode}</p>}
              {specificInstructions && <p>Instructions: {specificInstructions}</p>}
              {request.emergencyContact && <p><strong>Emergency Contact: Yes</strong></p>}
              {request.currentLocation && (
                <button
                  onClick={() => window.open(`https://www.google.com/maps?q=${request.currentLocation}`, '_blank')}
                >
                  View Location
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default UserRejectedRequests;
