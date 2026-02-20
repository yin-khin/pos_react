// import React, { useState } from 'react';
// import request from '../../utils/request'; // Ensure the import path is correct for your project
// import { useNavigate } from 'react-router-dom';

// const LoginPage = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//    const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');

//     try {
//       // Using the fixed request utility: path, method, data
//       const responseData = await request('/api/login', 'POST', formData);
      
//       if (responseData.isLogin) {
//         // 1. Store the token and user info
//         localStorage.setItem('token', responseData.token);
//         localStorage.setItem('user', JSON.stringify(responseData.user));
        
//         setMessage('Login successful! Redirecting...');
        
//         // 2. Redirect to the dashboard using navigate
//         // Use a small delay to allow the user to see the success message
//         setTimeout(() => {
//           navigate('/dashboard');
//         }, 1000);
//       } else {
//         setMessage(responseData.message || 'Login failed');
//       }
//     } catch (error) {
//       // Handle the error returned from request utility
//       setMessage(error.response?.data?.message || 'Login failed. Please check your credentials.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className='body' style={{backgroundColor:"black"}}>
//     <div style={styles.container  }>
//       <div style={styles.card}>
//         <h2 style={styles.title}>Login</h2>
//         <form onSubmit={handleSubmit} style={styles.form}>
//           <div style={styles.inputGroup}>
//             <label style={styles.label}>Email Address</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Enter your email"
//               required
//               style={styles.input}
//             />
//           </div>
//           <div style={styles.inputGroup}>
//             <label style={styles.label}>Password</label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Enter your password"
//               required
//               style={styles.input}
//             />
//           </div>
//           {message && (
//             <p style={message.includes('successful') ? styles.success : styles.error}>
//               {message}
//             </p>
//           )}
//           <button type="submit" disabled={loading} style={styles.button}>
//             {loading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>
//         {/* <div style={styles.footer}>
//           <a href="/forget" style={styles.link}>Forgot Password?</a>
//           <p>Don't have an account? <a href="/register" style={styles.link}>Register</a></p>
//         </div> */}
//       </div>
//     </div>
//     </div>
//   );
// };

// const styles = {
//   body:{
//     backgroundColor:"black",
//   },
//   container: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     minHeight: '100vh',
//     backgroundColor: '#f5f5f5',
//     fontFamily: 'Arial, sans-serif'
//   },
//   card: {
//     backgroundColor: '#fff',
//     padding: '40px',
//     borderRadius: '8px',
//     boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//     width: '100%',
//     maxWidth: '400px'
//   },
//   title: {
//     textAlign: 'center',
//     marginBottom: '30px',
//     color: '#333'
//   },
//   form: {
//     display: 'flex',
//     flexDirection: 'column'
//   },
//   inputGroup: {
//     marginBottom: '20px'
//   },
//   label: {
//     display: 'block',
//     marginBottom: '8px',
//     fontSize: '14px',
//     color: '#666'
//   },
//   input: {
//     width: '100%',
//     padding: '12px',
//     borderRadius: '4px',
//     border: '1px solid #ddd',
//     boxSizing: 'border-box',
//     fontSize: '16px'
//   },
//   button: {
//     backgroundColor: '#007bff',
//     color: '#fff',
//     padding: '12px',
//     border: 'none',
//     borderRadius: '4px',
//     fontSize: '16px',
//     cursor: 'pointer',
//     marginTop: '10px',
//     transition: 'background-color 0.3s'
//   },
//   error: {
//     color: 'red',
//     fontSize: '14px',
//     marginBottom: '10px',
//     textAlign: 'center'
//   },
//   success: {
//     color: 'green',
//     fontSize: '14px',
//     marginBottom: '10px',
//     textAlign: 'center'
//   },
//   footer: {
//     marginTop: '20px',
//     textAlign: 'center',
//     fontSize: '14px'
//   },
//   link: {
//     color: '#007bff',
//     textDecoration: 'none'
//   }
// };

// export default LoginPage;

import React, { useState } from 'react';
import request from '../../utils/request'; // Ensure the import path is correct for your project
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Import the CSS file

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Using the fixed request utility: path, method, data
      const responseData = await request('/api/login', 'POST', formData);
      
      if (responseData.isLogin) {
        // 1. Store the token and user info
        localStorage.setItem('token', responseData.token);
        localStorage.setItem('user', JSON.stringify(responseData.user));
        
        setMessage('Login successful! Redirecting...');
        
        // 2. Redirect to the dashboard using navigate
        // Use a small delay to allow the user to see the success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setMessage(responseData.message || 'Login failed');
      }
    } catch (error) {
      // Handle the error returned from request utility
      setMessage(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 20C9.97 20 7.57 19.18 5.86 17.12C7.55 15.8 9.68 15 12 15C14.32 15 16.45 15.8 18.14 17.12C16.43 19.18 14.03 20 12 20Z" fill="url(#gradient)"/>
                <defs>
                  <linearGradient id="gradient" x1="2" y1="2" x2="22" y2="22">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                </svg>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper password-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="currentColor"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="input-field password-field"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye Open Icon
                    <svg className="eye-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor"/>
                    </svg>
                  ) : (
                    // Eye Closed Icon
                    <svg className="eye-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8.03 5.2L10.17 7.34C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.73 7C3.08 8.3 1.78 10.02 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM11.84 9.02L14.99 12.17L15.01 12.01C15.01 10.35 13.67 9.01 12.01 9.01L11.84 9.02Z" fill="currentColor"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {message && (
              <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {message.includes('successful') ? (
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                  ) : (
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                  )}
                </svg>
                <span>{message}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? (
                <>
                  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                    <path d="M12 2C6.48 2 2 6.48 2 12" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <a href="/forget" className="footer-link">Forgot Password?</a>
            <p className="footer-text">
              Don't have an account? <a href="/register" className="footer-link signup-link">Sign Up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
