import { useNavigate } from "react-router-dom";
import './RoleSelection.css';

function RoleSelection() {
    const navigate = useNavigate();

    return (
        <div className="role-container">
            <div className="role-box">
            <h2>Select Role</h2>
            <button onClick={() => navigate("/auth/user")}>User</button>
            <button onClick={() => navigate("/auth/provider")}>Provider</button>
            </div>
        </div>
    );
}

export default RoleSelection;
