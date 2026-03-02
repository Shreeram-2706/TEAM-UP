import React, { useState } from "react";
import Logo from "../../assets/logo.png";
import SignUpImage from "../../assets/signup.png";
import { useNavigate } from "react-router-dom";
import BasicDetailsForm from "../../components/AuthComponents/BasicDetailsForm";
import SpecializationForm from "../../components/AuthComponents/SpecializationForm";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [department, setDepartment] = useState("");
  const [skills, setSkills] = useState([]);


  const handleNext = () => {
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(""); 
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError(""); 
  };
  
  const API_URL ="http://localhost:8000";

  const handleSignUp = async () => {
    if (!department) {
      setError("Please select a department.");
      return;
    }
  
    const userData = {
      username,
      email,
      password,
      department,
      skills,
    };
  
    try {
      const response = await fetch(`${API_URL}/auth/createaccount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Sign-up failed");
      }
  
      navigate("/login");
    } catch (error) {
      setError(error.message);
    }
  };
 
  

  return (
    <div className="signup flex h-screen items-center justify-center">
      <div className="form bg-white p-8 rounded-lg md:w-[40%] m-auto">
        <img className="h-17 m-auto" src={Logo} alt="Logo" />
        <h1 className="text-2xl font-bold m-7 text-center">
          {step === 1 ? "Create your Account" : "Just One More Step"}
        </h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {step === 1 ? (
          <BasicDetailsForm
            username={username}
            setUsername={setUsername}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            handleNext={handleNext}
          />
        ) : (
          <SpecializationForm
            department={department}
            setDepartment={setDepartment}
            skills={skills}
            setSkills={setSkills}
            handleSignUp={handleSignUp}
            handleBack={handleBack}
          />
        )}



        <div className="flex justify-center">
          <p className="text-center py-3">Already have an account?</p>
          <p className="text-sky-500 p-3 cursor-pointer" onClick={() => navigate("/login")}>
            Log In
          </p>
        </div>
      </div>

      <div className="image hidden bg-white floating-animation align-center justify-center md:w-[50%] md:flex md:w-1/2 float-animation">
        <img className="m-auto w-[90vh]" src={SignUpImage} alt="Signup" />
      </div>
    </div>
  );
};

export default SignUpPage;
