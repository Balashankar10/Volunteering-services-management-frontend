import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoleSelection from "./components/RoleSelection";
import Auth from "./components/Auth";
import UserDashboard from "./pages/UserDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import EditServiceDetails from "./pages/EditServiceDetails";
import RequestService from "./pages/RequestService";
import PendingRequests from "./pages/PendingRequests"; // For providers
import UserAcceptedRequests from "./pages/UserAcceptedRequests";
import UserRejectedRequests from "./pages/UserRejectedRequests";
import Userpr from "./pages/Userpr";
import AcceptedOrders from "./pages/AcceptedOrders";
import RateProvider from "./pages/RateProvider";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<RoleSelection />} />
                <Route path="/auth/:role" element={<Auth />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/provider-dashboard" element={<ProviderDashboard />} />
                <Route path="/edit-service-details" element={<EditServiceDetails />} />
                <Route path="/request-service/:providerId" element={<RequestService />} />
                <Route path="/pending-requests" element={<PendingRequests />} /> {/* For provider */}
                <Route path="/accepted-requests" element={<UserAcceptedRequests />} />
                <Route path="/rejected-requests" element={<UserRejectedRequests />} />
                <Route path="/userpr" element={<Userpr />} />
                <Route path="/accepted-orders" element={<AcceptedOrders />} />
                <Route path="/rate-provider" element={<RateProvider />} />
            </Routes>
        </Router>
    );
}

export default App;
