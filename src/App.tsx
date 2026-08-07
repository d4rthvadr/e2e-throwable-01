import { AuthPage } from "./features/auth/AuthPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { useAuth } from "./auth/AuthContext";

function App() {
  const { isLoading, isAuthenticated, currentUser, logout } = useAuth();

  if (isLoading) {
    return (
      <main className="loading-layout" data-testid="app-loading">
        <p>Loading app...</p>
      </main>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <AuthPage />;
  }

  return <DashboardPage user={currentUser} onLogout={logout} />;
}

export default App;
