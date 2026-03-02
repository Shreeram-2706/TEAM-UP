import React, { useState, useEffect } from 'react';
import Logo from '../../assets/logo.png';
import VerifyCodeImg from '../../assets/verifyOTP.png';
import { useNavigate } from 'react-router-dom';
import { Key } from 'lucide-react';

const VerifyCode = ({setRPwdStatus}) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const email = localStorage.getItem('resetEmail');

  useEffect(() => {
    let timer;
    if (isResendDisabled && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [resendTimer, isResendDisabled]);

  const handleVerifyOTP = async (event) => {
    event.preventDefault();
    setMessage({ text: '', isError: false });

    if (!otp) {
      setMessage({ text: 'Please enter the OTP.', isError: true });
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setMessage({ text: 'OTP Verified! Redirecting...', isError: false });
        setRPwdStatus(true);
        setTimeout(() => {
          navigate('/reset-password');
        }, 1500); 
      } else {
        setMessage({ text: data.message || 'Invalid OTP. Please try again.', isError: true });
      }
    } catch (err) {
      setMessage({ text: 'Failed to verify OTP. Please try again.', isError: true });
    }
  };

  const handleResendOTP = async () => {
    setMessage({ text: '', isError: false });
    setIsResendDisabled(true);
    setResendTimer(30);

    try {
      const response = await fetch('http://localhost:8000/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setMessage({ text: 'OTP Resent! Please check your email.', isError: false });
      } else {
        setMessage({ text: data.message || 'Failed to resend OTP.', isError: true });
      }
    } catch (err) {
      setMessage({ text: 'Failed to resend OTP. Please try again.', isError: true });
    }
  };

  return (
    <div className="sign-up flex h-[100vh] align-center justify-center">
      <div className="form w-[100%] md:w-[50%] m-auto">
        <div className="flex flex-col h-full w-full items-center m-auto">
        <img className="h-15 m-auto" src={Logo} alt="Logo" />
        <h1 className="text-2xl font-bold m-7 text-center">Verify One Time Password</h1>
        <form onSubmit={handleVerifyOTP} className='w-[80%] m-auto md:w-[70%]'>
          <label className="font-bold m-4">Enter your One-Time Password</label>
          <div className="flex items-center h-10 w-[100%] border border-gray-300 m-3 bg-white rounded-sm px-5">
            <Key className="text-gray-500" size={20} />
            <input
              className="w-full h-full ml-3 px-3 outline-none"
              placeholder="Enter your OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          {message.text && (
            <p className={`m-3 text-center ${message.isError ? 'text-red-600' : 'text-green-600'}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            className="h-10 w-[100%] m-3 bg-sky-500 text-white rounded-sm hover:bg-sky-600 transition-all duration-500"
          >
            Verify OTP
          </button>
        </form>
        </div>
        <p className="text-sm text-gray-600 m-2 text-center">Didn't receive the OTP?</p>
        <div className="flex justify-center">
          <button
            className={`h-fit w-[20%] m-5 rounded-sm transition-all duration-500 
              ${isResendDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-sky-500 text-white hover:bg-sky-600'}`}
            onClick={handleResendOTP}
            disabled={isResendDisabled}
          >
            {isResendDisabled ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
      <div className="image hidden bg-white float-animation align-center justify-center md:flex md:w-[50%] md:w-1/2">
        <img className="m-auto w-[90vh]" src={VerifyCodeImg} alt="Verify Code" />
      </div>
    </div>
  );
};

export default VerifyCode;
