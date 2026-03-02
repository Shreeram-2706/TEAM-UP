import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo.png';
import ForgotPwdImage from '../../assets/forgot-password.png';
import { Mail } from 'lucide-react';

const ForgotPwd = ({ setOtpStatus }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/auth/generate-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('OTP sent successfully! Please check your email.');
                localStorage.setItem('resetEmail', email);
                setOtpStatus(true);
                setTimeout(() => {
                    navigate('/verify-code', { state: { email } });
                }, 1500);
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sign-up flex h-[100vh] align-center justify-center">
            <div className="form w-[100%] flex m-auto md:w-[50%]">
                <div className='m-auto w-[80%]'>
                <img className="h-15 m-auto" src={Logo} alt="Logo" />
                <h1 className="text-2xl font-bold text-center m-6">Forgot Password?</h1>
                <form onSubmit={handleSendOTP}>
                    <label className="font-bold m-4">Enter your email</label>
                    <div className="flex items-center h-10 w-[90%] m-3 bg-white border border-gray-300 rounded-sm px-5">
                        <Mail className="text-gray-500" size={20} />
                        <input
                            className="w-full h-full ml-3 px-3 outline-none"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-center">
                        {error && <p className="text-red-600 m-3 text-center">{error}</p>}
                        {message && <p className="text-green-600 m-3 text-center">{message}</p>}
                    </div>
                    <button
                        className={`h-10 w-[90%] m-3 ${loading ? 'bg-gray-400' : 'bg-sky-500 hover:bg-sky-600'} text-white rounded-sm transition-all duration-500 text-center`}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </form>
                </div>
            </div>
            <div className="image w-0 hidden bg-white float-animation md:flex md:w-[50%]">
                <img className="m-auto w-[75vh]" src={ForgotPwdImage} alt="Forgot Password" />
            </div>
        </div>
    );
};

export default ForgotPwd;
