import React from "react";

// Function to render stars based on the rating
function renderStars(rating) {
    const fullStars = Math.floor(rating); // Get the number of full stars
    const decimal = rating - fullStars; // Get the decimal part of the rating
    const halfStars = decimal >= 0.5 ? 1 : 0; // If the decimal is 0.5 or higher, add a half star
    const emptyStars = 5 - fullStars - halfStars; // The remaining stars are empty

    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        stars.push('★');
    }

    // Add half star if applicable
    if (halfStars) {
        stars.push('✰');
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars.push('☆');
    }

    return stars.join(''); // Join the array to form the rating string
}

// Rating component that displays the rating with stars
function Rating({ rating }) {
    // Ensure rating is a valid number
    const validRating = Number(rating);
    if (isNaN(validRating)) {
        return <p>No rating available</p>; // If invalid, display a default message
    }

    // Clamping the rating between 0 and 5
    const clampedRating = Math.max(0, Math.min(5, validRating));

    return (
        <div className="rating-container">
            {/* Display the rating stars and the value */}
            <p className="stars">{renderStars(clampedRating)}</p>
            <p className="rating-value">({clampedRating.toFixed(1)})</p> {/* Display the numerical rating */}
        </div>
    );
}

export default Rating;
