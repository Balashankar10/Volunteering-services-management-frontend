import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserAcceptedRequests.css";

const UserAcceptedRequests = () => {
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/accepted-requests", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAcceptedRequests(response.data);
      } catch (err) {
        setError("Error fetching accepted requests");
        console.error(err);
      }
    };

    fetchRequests();
  }, []);

  const openLocationInMaps = (location) => {
    const url = `https://www.google.com/maps?q=${location}`;
    window.open(url, "_blank");
  };

  const handleConfirmCompletion = async () => {
    if (confirmation === "CONFIRM") {
      try {
        await axios.put(
          `http://localhost:5000/api/confirm-completion/${selectedRequest._id}`,
          { confirmation },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setAcceptedRequests(prev =>
          prev.map(request =>
            request._id === selectedRequest._id ? { ...request, completion: 2 } : request
          )
        );

        setShowPopup(false);
        setConfirmation("");
        setError(null);
      } catch (err) {
        console.error(err.response?.data || err.message);
        setError(err.response?.data?.error || "Error confirming job completion");
      }
    } else {
      setError("❌ Please type 'CONFIRM' to confirm the job completion.");
    }
  };

  const handleRateClick = async (request) => {
    try {
      await axios.put(
        `http://localhost:5000/update-completion/${request._id}`,
        { completion: 3 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setAcceptedRequests(prev =>
        prev.map(r =>
          r._id === request._id ? { ...r, completion: 3 } : r
        )
      );

      localStorage.setItem("userEmail", request.userEmail);
      localStorage.setItem("providerEmail", request.providerEmail);
      localStorage.setItem("requestedDate", request.currentTime);

      window.location.href = "/rate-provider";
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Error updating completion status");
    }
  };

  const handlePayClick = async (request) => {
    try {
      // 1. Create Razorpay order
      const orderResponse = await axios.post("http://localhost:5000/api/payment/create-order", {
        fee: request.fee,
      });

      const orderData = orderResponse.data;

      const options = {
        key: "rzp_test_gIrxmM3GMofUDc", // Replace with your real key_id
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Services Management",
        description: `Payment for ${request.name}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            await axios.post("http://localhost:5000/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              requestId: request._id,
            });

            setAcceptedRequests(prev =>
              prev.map(r =>
                r._id === request._id ? { ...r, completion: 5 } : r
              )
            );

            alert("✅ Payment successful. Status updated.");
          } catch (verifyError) {
            console.error(verifyError);
            alert("❌ Payment verification failed.");
          }
        },
        prefill: {
          name: request.name,
          email: request.userEmail,
          contact: request.phoneNumber,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed", err);
      alert("❌ Error initiating payment");
    }
  };

  return (
    <div>
      <h2>Accepted Requests</h2>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      {acceptedRequests.length > 0 ? (
        acceptedRequests.map((request, index) => (
          <div key={index} className="request-card">
            <div><label>Name:</label> <span>{request.name}</span></div>
            <div><label>Date:</label> <span>{request.date}</span></div>
            <div><label>Time:</label> <span>{request.time}</span></div>
            <div><label>DOB:</label> <span>{request.dob}</span></div>
            <div>
              <label>Address:</label>
              <span>{`${request.fullHomeAddress.street}, ${request.fullHomeAddress.city}, ${request.fullHomeAddress.zipCode}`}</span>
            </div>
            <div>
              <label>Location:</label>
              <button onClick={() => openLocationInMaps(request.currentLocation)}>
                View Location
              </button>
            </div>
            <div><label>Phone:</label> <span>{request.phoneNumber}</span></div>
            {request.landmarkDescription && (
              <div><label>Landmark:</label> <span>{request.landmarkDescription}</span></div>
            )}
            {request.emergencyContact && (
              <div><label>Emergency Contact:</label> <span>{request.emergencyContact ? "Yes" : "No"}</span></div>
            )}

            {request.completion === 1 && (
              <button
                className="confirm-job-btn"
                onClick={() => {
                  setSelectedRequest(request);
                  setShowPopup(true);
                  setError(null);
                }}
              >
                Confirm Job Completion
              </button>
            )}

            {request.completion === 2 && (
              <div style={{ marginTop: "10px" }}>
                <div style={{ color: "green" }}>✅ Job Completed</div>
                <button className="rate-btn" onClick={() => handleRateClick(request)}>
                  Rate
                </button>
              </div>
            )}

            {request.completion === 3 && (
              <div style={{ color: "blue", marginTop: "10px" }}>⭐ Already Rated</div>
            )}

            {request.fee != null && request.fee !== undefined && (
              <div style={{ marginTop: "10px" }}>
                <button className="pay-btn" onClick={() => handlePayClick(request)}>
                  Pay ₹{request.fee}
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <div>No accepted requests found.</div>
      )}

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Confirm Job Completion</h3>
            <p>Please type <strong>CONFIRM</strong> to confirm:</p>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="confirmation-input"
            />
            <button onClick={handleConfirmCompletion}>Confirm</button>
            <button onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAcceptedRequests;
