import React, { useState } from "react";
import axios from "axios";
import "./RateProvider.css";

const RateProvider = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [message, setMessage] = useState("");

  const userEmail = localStorage.getItem("userEmail");
  const providerEmail = localStorage.getItem("providerEmail");
  const requestedDate = localStorage.getItem("requestedDate");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !review.trim()) {
      setMessage("❌ Please provide both rating and review.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/submit-rating", {
        userEmail,
        providerEmail,
        requestedDate,
        rating,
        review,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setMessage("✅ Rating submitted successfully!");
      setRating(0);
      setReview("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit rating.");
    }
  };

  return (
    <div className="rate-page">
      <h2>Rate Your Provider</h2>
      {message && <p className="rate-msg">{message}</p>}

      <form onSubmit={handleSubmit} className="rate-form">
        <div className="star-row">
          <label>Rating:</label>
          <div>
            {[1,2,3,4,5].map((star) => (
              <span
                key={star}
                className={`star ${star <= (hover||rating) ? "filled" : ""}`}
                onClick={()=>setRating(star)}
                onMouseEnter={()=>setHover(star)}
                onMouseLeave={()=>setHover(0)}
              >★</span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Review:</label>
          <textarea
            value={review}
            onChange={e=>setReview(e.target.value)}
            placeholder="Write your feedback here..."
            rows={4}
          />
        </div>

        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default RateProvider;
