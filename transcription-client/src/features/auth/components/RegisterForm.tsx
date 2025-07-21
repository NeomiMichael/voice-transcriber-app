import React, { useState } from 'react';
import { registerUser } from '../authApi';
import { Link } from 'react-router-dom'

interface RegisterFormProps {
    onRegisterSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const { error } = await registerUser(email, password);
            if (error) {
                // בדיקת שגיאה של משתמש קיים
                if (
                  error.status === 400 ||
                  error.message?.toLowerCase().includes('already registered') ||
                  error.message?.toLowerCase().includes('user already exists')
                ) {
                  alert('משתמש עם האימייל הזה כבר קיים במערכת!');
                }
                setError(error.message || 'שגיאה בהרשמה');
            } else {
                setSuccess('נרשמת בהצלחה!');
                if (onRegisterSuccess) onRegisterSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'שגיאה בהרשמה');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>הרשמה</h2>
            <div>
                <label>אימייל:</label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>סיסמה:</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>}
            <button type="submit" disabled={loading}>
                {loading ? 'נרשם...' : 'הרשם'}
            </button>
            <p style={{ marginTop: '15px' }}>
                כבר יש לך חשבון?
                <Link to="/login" style={{ marginLeft: '5px' }}>להתחברות</Link>
            </p>

        </form>
    );
};

export default RegisterForm; 