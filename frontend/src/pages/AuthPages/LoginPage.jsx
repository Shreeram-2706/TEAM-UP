    import React, { useState } from 'react';
    import Logo from '../../assets/logo.png';
    import LoginImage from '../../assets/login.png';
    import { useNavigate } from 'react-router-dom';
    import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

    const LogIn = ({setFPwdStatus, setIsFaculty}) => {
        const navigate = useNavigate();
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [showPassword, setShowPassword] = useState(false);
        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');

        const API_URL = 'http://localhost:8000';

        const doLogin = async (event) => {
            localStorage.clear();
            event.preventDefault();

            if (!email || !password) {
                setError('Please fill all the fields');
                return;
            }
            if (!email.endsWith('@sece.ac.in')) {
                setError("Email must belong to `sece.ac.in` domain");
                return;
            }

            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const data = await res.json();

                if (res.status === 200) {
                    localStorage.setItem('token', data.token);
                    
                    setError('');
                    setSuccess("Login successful");
                    setTimeout(() => {
                        navigate('/dashboard');
                        window.location.reload();
                    }, 1000);
                } else {
                    setError(data.message || 'Login failed');
                }
            } catch (err) {
                setError(err.message);
            }
        };

        return (
            <div className="login flex h-screen items-center justify-center">
                <div className='form bg-white p-8 rounded-lg md:w-[40%] m-auto'>
                    <img className='h-17 m-auto' src={Logo} alt="Logo" />
                    <h1 className='text-2xl font-bold m-7 text-center'>Log In to Your Account</h1>
                    <form onSubmit={doLogin}>
                        <label className='font-bold m-2'>Email</label>
                        <div className='flex items-center h-10 w-full m-3 bg-white border border-gray-300 rounded-sm px-5'>
                            <Mail className='text-gray-500' size={20} />
                            <input
                                className='w-full h-full ml-3 px-3 outline-none'
                                placeholder='Enter your email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <label className='font-bold m-2'>Password</label>
                        <div className='flex items-center h-10 w-full m-3 bg-white border border-gray-300 rounded-sm px-5'>
                            <Lock className='text-gray-500' size={20} />
                            <input
                                className='w-full ml-3 px-3 h-full outline-none'
                                type={showPassword ? 'text' : 'password'}
                                placeholder='Enter your password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {showPassword ? (
                                <EyeOff className='text-gray-500 cursor-pointer ml-3' size={20} onClick={() => setShowPassword(!showPassword)} />
                            ) : (
                                <Eye className='text-gray-500 cursor-pointer ml-3' size={20} onClick={() => setShowPassword(!showPassword)} />
                            )}
                        </div>

                        <div className='flex justify-end'>
                            <p
                                className='hookbtn text-left mx-0 my-3 text-sky-600 hover:text-sky-800 cursor-pointer'
                                onClick={() => {
                                    setFPwdStatus(true);
                                    setTimeout(() => {
                                        navigate('/forgot-password');
                                    }, 300);
                                }}
                            >
                                Forgot Password?
                            </p>
                        </div>

                        <button
                            type="submit"
                            className='h-10 w-full m-3 bg-sky-500 text-white rounded-sm hover:bg-sky-600 transition-all duration-500'
                        >
                            Log In
                        </button>
                    </form>

                    {error && <p className='error text-red-500 text-center'>{error}</p>}
                    {success && <p className='success text-green-500 text-center'>Login Successful</p>}

                    <div className="flex justify-center">
                        <p className='text-center py-3'>Don't have an account?</p>
                        <a className='text-sky-600 p-3 cursor-pointer' onClick={() => navigate("/sign-up")}>Sign Up</a>
                    </div>
                </div>

                <div className="image hidden bg-white floating-animation align-center justify-center md:w-[50%] md:flex md:w-1/2 float-animation">
                    <img className="m-auto w-[90vh]" src={LoginImage} alt="Login" />
                </div>
            </div>
        );
    };

    export default LogIn;
