import React, { useState } from "react";
import PropTypes from "prop-types";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

const BasicDetailsForm = ({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  handleNext,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const validateAndNext = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@sece\.ac\.in$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{7,}$/;

    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Enter a valid 'sece.ac.in' email address.");
      return;
    }
    if (!passwordRegex.test(password)) {
      setError("Password must be 7+ chars, include a number, letter, and symbol.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    handleNext();
  };

  return (
    <div>
      <label className="font-bold m-2">User Name</label>
      <div className="flex items-center h-10 w-full m-3 bg-white border border-gray-300 rounded-sm px-5">
        <User className="text-gray-500" size={20} />
        <input
          className="w-full h-full ml-3 px-3 outline-none bg-transparent"
          type="text"
          placeholder="Enter your full name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <label className="font-bold m-2">Email</label>
      <div className="flex items-center h-10 w-full m-3 bg-white border border-gray-300 rounded-sm px-5">
        <Mail className="text-gray-500" size={20} />
        <input
          className="w-full h-full ml-3 px-3 outline-none bg-transparent"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <label className="font-bold m-2">Password</label>
      <div className="flex items-center h-10 w-full m-3 bg-white border border-gray-300 rounded-sm px-5">
        <Lock className="text-gray-500" size={20} />
        <input
          className="w-full ml-3 px-3 h-full outline-none bg-transparent"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {showPassword ? (
          <EyeOff
            className="text-gray-500 cursor-pointer ml-3"
            size={20}
            onClick={() => setShowPassword(!showPassword)}
          />
        ) : (
          <Eye
            className="text-gray-500 cursor-pointer ml-3"
            size={20}
            onClick={() => setShowPassword(!showPassword)}
          />
        )}
      </div>

      <label className="font-bold m-2">Confirm Password</label>
      <div className="flex items-center h-10 w-full m-3 bg-white border border-gray-300 rounded-sm px-5">
        <Lock className="text-gray-500" size={20} />
        <input
          className="w-full ml-3 px-3 h-full outline-none bg-transparent"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {showConfirmPassword ? (
          <EyeOff
            className="text-gray-500 cursor-pointer ml-3"
            size={20}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        ) : (
          <Eye
            className="text-gray-500 cursor-pointer ml-3"
            size={20}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        )}
      </div>

      {error && <p id="error-message" className="text-red-500 text-center mt-2">{error}</p>}

      <button
        onClick={validateAndNext}
        className="w-full bg-sky-500 m-3 text-white p-2 rounded hover:bg-sky-600 transition-all duration-500"
      >
        Next
      </button>
    </div>
  );
};

BasicDetailsForm.propTypes = {
  username: PropTypes.string.isRequired,
  setUsername: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  confirmPassword: PropTypes.string.isRequired,
  setConfirmPassword: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
};

export default BasicDetailsForm;