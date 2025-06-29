'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const decodeId = (encodedId) => {
  try {
    return atob(encodedId); // base64 
  } catch {
    return null;
  }
};

export default function EditDoctor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encodedId = searchParams.get('id');

  const [doctorId, setDoctorId] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactInfo: '',
    specialization: '',
     userId: '',
  });

  useEffect(() => {
  const role = localStorage.getItem('role');
  const storedUserId = localStorage.getItem("id"); 

  if (role === 'ADMIN') {
    setIsAuthorized(true);
    setFormData((prev) => ({ ...prev, userId: storedUserId }));
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
      router.push('/admin/viewAllDoctors');
      return;
    }

    setDoctorId(decoded);
  }, [encodedId, isAuthorized]);

  useEffect(() => {
    if (!doctorId || !isAuthorized) return;
    setLoading(true);

    fetch(`http://localhost:8082/api/admin/doctors/${doctorId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Doctor not found');
        return res.json();
      })
      .then((data) => {
        setFormData((prev) => ({
          ...prev,
          fullName: data.user.fullName || '',
          email: data.user.email || '',
          contactInfo: data.user.contactInfo || '',
          specialization: data.specialization || '',
        }));
        setLoading(false);
      })

      .catch((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message,
        });
        router.push('/admin/viewAllDoctors');
        setLoading(false);
      });
  }, [doctorId, isAuthorized]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:8082/api/admin/doctors/${doctorId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Doctor updated successfully',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
        setTimeout(() => router.push('/admin/viewAllDoctors'), 2000);
      } else {
        const errorText = await res.text();
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: errorText,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: err.message,
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
          <p className="text-sm text-gray-600 font-medium">Edit Doctor</p>
        </div>
      </div>

      {/* Form */}
      <div className="mt-20 flex justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-9 bg-white shadow-md rounded-2xl p-6 md:p-10">
          <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
          <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
          <Input label="Contact Info" name="contactInfo" value={formData.contactInfo} onChange={handleChange} />
          <Input label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} />
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
