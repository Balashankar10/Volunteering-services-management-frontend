import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import './Auth.css';

function Auth() {
    const { role } = useParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isRegister ? `/${role}/register` : `/${role}/login`;

        try {
            const { data } = await axios.post(`http://localhost:5000${endpoint}`, { email, password });
            setMessage(data.message);

            if (data.token) {
                localStorage.setItem("token", data.token);
                navigate(role === "user" ? "/user-dashboard" : "/provider-dashboard");
            }
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || "Error occurred");
        }
    };

    return (
        <div className="auth-container">
        <div className="auth-box">
            <h2>{isRegister ? "Register" : "Login"} as {role}</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">{isRegister ? "Create Account" : "Login"}</button>
            </form>
            <p>{message}</p>
            <button onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? "Already have an account? Login" : "New user? Register"}
            </button>
        </div>
        </div>
    );
}

export default Auth;
