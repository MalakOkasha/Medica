'use client';
import React, { useEffect, useState } from 'react';
import { Outfit } from 'next/font/google';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

const CreateAdmin = () => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactInfo: '',
    password: '',
  });

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'ADMIN') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const adminId = localStorage.getItem('id'); 
    const fullPayload = {
    ...formData,
    adminId: adminId ? parseInt(adminId) : null,
  };

    try {
      const response = await fetch('http://localhost:8082/api/auth/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();

        try {
          const errorData = JSON.parse(errorText);
          Swal.fire('Error', errorData.message || 'Failed to create admin', 'error');
        } catch {
          Swal.fire('Error', errorText || 'Failed to create admin', 'error');
        }
      } else {
        await Swal.fire({
          icon: 'success',
          title: 'Admin created!',
          text: 'The new doctor has been successfully created.',
          showConfirmButton: false,
          timer: 1800,
        });
        router.push('/admin/viewAllAdmins');
      }
    } catch (error) {
      Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
    }
  };

  if (isAuthorized === false) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-4 text-center ${outfit.className}`}>
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-xl text-lg font-semibold mb-6">
            {errorMessage}
          </div>
        )}
        <button
          onClick={() => router.push('/login')}
          className="bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-black font-semibold py-2 px-6 rounded-xl shadow-lg transition duration-300"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className={`w-screen min-h-screen bg-gradient-to-b from-white to-blue-100 px-4 md:px-10 py-10 ${outfit.className}`}>
      {/* SVG + Logo */}
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-blue-200 p-2 rounded-full shadow-md animate-pulse">
          <svg width="45" height="45" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="47" height="47" rx="23.5" fill="#C6DEFD" />
            <path
              d="M34 24H30L27 33L21 15L18 24H14"
              stroke="#252B61"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h1
            className="text-3xl font-extrabold text-blue-950 tracking-tight cursor-pointer"
            onClick={() => router.push('/admin/homepage')}
          >
            Medica
          </h1>
          <p className="text-sm text-gray-600 font-medium">Create New Admin</p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-25 max-w-5xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-md p-6 md:p-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InputField label="Name" name="fullName" value={formData.fullName} onChange={handleChange} />
          <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
          <InputField label="Phone Number" name="contactInfo" type="tel" value={formData.contactInfo} onChange={handleChange} />
         <div>
           <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <p className="text-blue-800 font-semibold mb-3">Your password must contain:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 pl-2 text-sm text-blue-800">
              <p>• <span className="font-medium">At least 8 characters</span></p>
              <p>• <span className="font-medium">1 uppercase letter (A–Z)</span></p>
              <p>• <span className="font-medium">1 lowercase letter (a–z)</span></p>
              <p>• <span className="font-medium">1 number (0–9)</span></p>
              <p>• <span className="font-medium">1 special character (!@#$...)</span></p>
            </div>
          </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button
            type="submit"
            className="w-64 h-14 bg-blue-300 hover:bg-blue-400 rounded-full text-black text-lg md:text-xl font-bold transition shadow cursor-pointer"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};


const InputField = ({ label, name, value, onChange, type = 'text' }) => (
  <div>
    <label className="text-blue-950 text-lg font-semibold mb-2 block">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required
      className="w-full h-14 border border-gray-300 rounded-xl px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
    />
  </div>
);

export default CreateAdmin;
