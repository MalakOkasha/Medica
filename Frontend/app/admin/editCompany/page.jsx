'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const decodeId = (encodedId) => {
  try {
    return atob(encodedId);
  } catch {
    return null;
  }
};

export default function EditPharmaCompany() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encodedId = searchParams.get('id');

  const [pharmaId, setPharmaId] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    contactInfo: '',
    location: '',
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

  useEffect(() => {
    if (!encodedId || isAuthorized !== true) return;

    const decoded = decodeId(encodedId);
    if (!decoded) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid link',
        text: 'Something went wrong. Please try again.',
      });
      router.push('/admin/pharmaOptions');
      return;
    }

    setPharmaId(decoded);
  }, [encodedId, isAuthorized]);

  useEffect(() => {
    if (!pharmaId || isAuthorized !== true) return;

    setLoading(true);

    fetch(`http://localhost:8082/api/pharma/${pharmaId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Pharma Company not found');
        return res.json();
      })
      .then((data) => {
        setFormData({
          fullName: data.user.fullName || '',
          email: data.user.email || '',
          password: data.user.password || '',
          contactInfo: data.user.contactInfo || '',
          location: data.location || '',
        });
        setLoading(false);
      })
      .catch((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Failed to fetch pharma company data',
          text: err.message,
        });
        setLoading(false);
        router.push('/admin/pharmaOptions');
      });
  }, [pharmaId, isAuthorized]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
  try {
    const res = await fetch(
      `http://localhost:8082/api/pharma/update/${pharmaId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            contactInfo: formData.contactInfo,
          },
          location: formData.location,
        }),
      }
    );

    if (!res.ok) {
      // Determine if the response is JSON
      const contentType = res.headers.get('content-type') || '';
      let serverMessage = 'An unexpected error occurred.';

      if (contentType.includes('application/json')) {
        // Try to parse JSON error payload
        try {
          const errorPayload = await res.json();
          // Assume your API returns { message: "..."} on error
          serverMessage = errorPayload.message || serverMessage;
        } catch (parseErr) {
          // JSON was malformed—fall back to raw text
          const text = await res.text();
          serverMessage = text || serverMessage;
        }
      } else {
        // If not JSON, read it as plain text
        const text = await res.text();
        serverMessage = text || serverMessage;
      }

      Swal.fire({
        icon: 'error',
        title: 'Update failed',
        text: serverMessage,
      });
      return; // exit early
    }

    // If we reach here, the response was OK
    Swal.fire({
      icon: 'success',
      title: 'Pharma company updated successfully',
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (networkErr) {
    // Only network-level errors (DNS, CORS, aborted, etc.) land here
    Swal.fire({
      icon: 'error',
      title: 'Network error',
      text: networkErr.message,
    });
  }
};

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-4 text-center">
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

  if (loading) return <div className="text-center py-10 text-lg font-semibold">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100 px-6 py-12 font-sans">
      {/* Header */}
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
          <p className="text-sm text-gray-600 font-medium">Edit Pharma Company</p>
        </div>
      </div>

      {/* Form */}
      <div className="mt-20 flex justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-9 bg-white shadow-md rounded-2xl p-6 md:p-10">
          <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
          <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
          <Input label="Contact Info" name="contactInfo" value={formData.contactInfo} onChange={handleChange} />
          <Input label="Location" name="location" value={formData.location} onChange={handleChange} />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center mt-10">
        <button
          onClick={handleUpdate}
          className="w-40 h-14 bg-blue-300 rounded-full text-black font-bold shadow hover:bg-blue-400 transition cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  );
}

const Input = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-blue-950 text-lg font-semibold mb-2">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full h-12 border border-gray-300 rounded-xl px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
    />
  </div>
);
