// src/pages/Authentication.jsx - Updated version
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Book } from 'lucide-react';
import useLogin from '../hooks/useLogin';
import { useAuth } from '../context/AuthContext';

// AuthInputField component with enhanced styling
const AuthInputField = ({ 
  label, 
  placeholder, 
  type = "text", 
  error = "", 
  value, 
  onChange,
  autoFocus = false,
  icon
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-indigo-900 mb-2">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400">
          {icon}
        </div>
        <input
          type={isPassword && showPassword ? "text" : type}
          className={`w-full pl-12 pr-12 py-4 bg-white border-2 ${
            error ? 'border-red-400 bg-red-50' : 'border-indigo-100 group-hover:border-indigo-300'
          } rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 shadow-sm`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoFocus={autoFocus}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-400 hover:text-indigo-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
};

// Authentication component with beautiful design
const Authentication = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  
  const { login, loading } = useLogin();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already logged in, redirect to home or intended page
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await login(email, password);

    if (!result.success) {
      setErrors({ general: result.error });
    }
    // Successful login handled by useEffect above
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Beautiful gradient background with illustration */}
          <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
            
            <div className="relative">
              <div className="flex items-center mb-8">
                <Book className="h-10 w-10 text-white" />
                <h2 className="ml-3 text-2xl font-bold text-white">Library Management System</h2>
              </div>
              
              <h1 className="text-4xl font-bold text-white mt-10 leading-tight">Discover a world of knowledge at your fingertips</h1>
              
              <p className="mt-6 text-indigo-100 text-lg">
                Access thousands of books, journals, and resources with your library account.
              </p>
            </div>
            
            <div className="relative mt-12 flex items-center justify-center">
              <img
                src="/api/placeholder/400/320"
                alt="Library"
                className="max-w-full h-auto rounded-xl shadow-lg"
              />
            </div>
            
            <div className="relative mt-12 text-white text-sm border-l-4 border-indigo-300 pl-4">
              <p className="text-lg font-light italic">"The only thing that you absolutely have to know, is the location of the library."</p>
              <p className="mt-2 font-medium text-indigo-200">— Albert Einstein</p>
            </div>
          </div>
          
          {/* Right side - Authentication form */}
          <div className="md:w-1/2 p-8 md:p-12 lg:p-16">
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-indigo-900">Welcome Back</h1>
              <p className="text-indigo-600 mt-3 text-lg">Enter your credentials to access your account</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-8">
              <AuthInputField
                label="Email Address"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                error={errors.email}
                autoFocus
                onKeyDown={handleKeyDown}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
              
              <AuthInputField
                label="Password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                error={errors.password}
                onKeyDown={handleKeyDown}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 transform hover:-translate-y-1 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
              
              {errors.general && (
                <p className="mt-4 text-red-500 text-center font-medium">{errors.general}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentication;