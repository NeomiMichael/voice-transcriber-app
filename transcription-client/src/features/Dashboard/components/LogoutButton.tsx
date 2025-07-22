import { logoutUser } from '../../auth/authApi';

export default function LogoutButton() {
  const handleLogout = async () => {
    await logoutUser();
    window.location.reload(); // מרענן את הדף כדי לעדכן את ה-context
  };
  return (
    <button onClick={handleLogout} style={{ margin: '16px', padding: '8px 16px', fontSize: '1rem' }}>
      התנתקות
    </button>
  );
}
