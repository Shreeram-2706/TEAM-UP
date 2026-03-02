import React, { useState } from 'react';
import Logo from '../../assets/logo.png';
import ResetPwdImg from '../../assets/reset-password.png';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';

const ResetPwd = ({ setOtpStatus, setFPwdStatus, setRPwdStatus }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const email = localStorage.getItem('resetEmail');

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setMessage({ text: '', isError: false });

    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters.', isError: true });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', isError: true });
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/auth/reset-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setMessage({ text: 'Password changed successfully! Redirecting...', isError: false });
        setOtpStatus(false);
        setFPwdStatus(false);
        setRPwdStatus(false);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setMessage({ text: data.message || 'Failed to reset password.', isError: true });
      }
    } catch (err) {
      setMessage({ text: 'Something went wrong. Please try again.', isError: true });
    }
  };

  return (
    <div className="sign-up flex h-screen items-center justify-center">
      <div className="form bg-white p-8 w-[90%] rounded-lg md:w-[50%] m-auto">
        <img className="h-17 m-auto" src={Logo} alt="Logo" />
        <h1 className="text-2xl font-bold m-7 text-center">Reset Your Password</h1>
        <form onSubmit={handlePasswordReset} className="w-full m-auto md:w-[80%]">
          <label className="font-bold mb-2 block">Enter your New Password</label>
          <div className="flex items-center h-12 w-full border border-gray-300 bg-white rounded-md px-4">
            <Lock className="text-gray-500" size={20} />
            <input
              className="w-full h-full px-3 outline-none"
              placeholder="Enter your new password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {showPassword ? (
              <EyeOff className="text-gray-500 cursor-pointer" size={20} onClick={() => setShowPassword(false)} />
            ) : (
              <Eye className="text-gray-500 cursor-pointer" size={20} onClick={() => setShowPassword(true)} />
            )}
          </div>

          <label className="font-bold mt-4 mb-2 block">Confirm your New Password</label>
          <div className="flex items-center h-12 w-full border border-gray-300 bg-white rounded-md px-4">
            <Lock className="text-gray-500" size={20} />
            <input
              className="w-full h-full px-3 outline-none"
              placeholder="Confirm your new password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {showConfirmPassword ? (
              <EyeOff className="text-gray-500 cursor-pointer" size={20} onClick={() => setShowConfirmPassword(false)} />
            ) : (
              <Eye className="text-gray-500 cursor-pointer" size={20} onClick={() => setShowConfirmPassword(true)} />
            )}
          </div>

          {message.text && (
            <p className={`mt-3 text-center ${message.isError ? 'text-red-600' : 'text-green-600'}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            className="h-12 w-full mt-10 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-all duration-500">
            Change Password
          </button>
        </form>
      </div>
      
      <div className="image hidden bg-white floating-animation items-center justify-center md:w-[50%] md:flex">
        <img className="w-[90%] h-fit" src={ResetPwdImg} alt="Reset Password" />
      </div>
    </div>
  );
};

export default ResetPwd;
