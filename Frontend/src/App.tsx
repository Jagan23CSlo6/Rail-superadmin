import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Pages/Login";
import Report from "./Pages/Report";
import AdminList from "./Pages/AdminList";
import AddAdmin from "./Pages/AddAdmin";
import AdminDetails from "./Pages/AdminDetails";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-list"
          element={
            <ProtectedRoute>
              <AdminList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-details/:id"
          element={
            <ProtectedRoute>
              <AdminDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-login"
          element={
            <ProtectedRoute>
              <AddAdmin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
