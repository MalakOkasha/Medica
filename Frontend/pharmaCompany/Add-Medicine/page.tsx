'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Outfit } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function AddMedicinePage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [companyId, setCompanyId] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState<{ [key: string]: string }>({
    name: '',
    substitute0: '',
    substitute1: '',
    use0: '',
    use1: '',
    use2: '',
    sideeffect0: '',
    sideeffect1: '',
    sideeffect2: '',
  });

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'PHARMA_COMPANY') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
    }

    const storedCompany = JSON.parse(localStorage.getItem('companyId') || '{}');
    if (storedCompany?.id) {
      setCompanyId(storedCompany.id);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
  if (!companyId) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Company ID not found. Please log in again.',
      timer: 2500,
      showConfirmButton: false,
    });
    return;
  }

  try {
    const res = await fetch('http://localhost:8082/api/medicines/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, companyId: +companyId }),
    });

    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Medicine added successfully!',
        timer: 2000,
        showConfirmButton: false,
      });
      router.push('/pharmaCompany/View-Dataset');
      return;
    }

    // not OK → parse error body
    const contentType = res.headers.get('Content-Type') || '';
    let errorText: string;

    if (contentType.includes('application/json')) {
      const errJson = await res.json();
      // Spring’s ResponseStatusException JSON looks like:
      // { timestamp, status, error, message, path }
      errorText = errJson.message || JSON.stringify(errJson);
    } else {
      errorText = await res.text();
    }

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorText,
      timer: 3000,
      showConfirmButton: false,
    });
  } catch (networkErr: any) {
    // e.g. network down
    Swal.fire({
      icon: 'error',
      title: 'Network Error',
      text: networkErr.message || 'Something went wrong.',
      timer: 3000,
      showConfirmButton: false,
    });
  }
};

  if (!isAuthorized) {
    return (
      <div className={`min-h-screen overflow-hidden flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-4 text-center ${outfit.className}`}>
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
    <div className={`min-h-screen overflow-hidden flex flex-col justify-start bg-gradient-to-b from-white to-blue-100 ${outfit.className}`}>
      <div className="px-6 py-9">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
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
              onClick={() => router.push('/pharmaCompany/Pharma-Dashboard')}
            >
              Medica
            </h1>
            <p className="text-sm text-gray-600 font-medium">Add Medicine</p>
          </div>
        </div>

        {/* Form */}
        <div className="flex justify-center">
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 bg-white shadow-md rounded-2xl p-15 md:p-10">
            {([
              ['name', 'Name'],
              ['substitute0', 'Substitute 1'],
              ['substitute1', 'Substitute 2'],
              ['use0', 'Use 1'],
              ['use1', 'Use 2'],
              ['use2', 'Use 3'],
              ['sideeffect0', 'Side Effect 1'],
              ['sideeffect1', 'Side Effect 2'],
              ['sideeffect2', 'Side Effect 3'],
            ] as [keyof typeof formData, string][]).map(([key, label]) => (
              <div key={key}>
                <label className="block text-blue-950 text-lg font-semibold mb-2">{label}</label>
                <input
                  type="text"
                  name={key as string}
                  value={formData[key]}
                  onChange={handleChange}
                  className="w-full h-12 border border-gray-300 rounded-xl px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-10">
          <button
            onClick={handleSubmit}
            className="w-48 h-14 rounded-full font-bold text-black bg-blue-300 hover:bg-blue-400 hover:scale-105 shadow-md transition-transform duration-200 cursor-pointer"
          >
            Add Medicine
          </button>
        </div>
      </div>
    </div>
  );
}
