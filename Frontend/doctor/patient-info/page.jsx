'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Outfit } from 'next/font/google';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import {
  faMagnifyingGlass,
  faPills,
  faUserInjured,
  faIndustry,
  faRobot,
  faHouseMedical
} from '@fortawesome/free-solid-svg-icons';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function PatientInfoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encodedId = searchParams.get('id');
  const patientId = encodedId ? atob(encodedId) : null;
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [patientData, setPatientData] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('role');

    if (role === 'DOCTOR') {
      setIsAuthorized(true);
      if (patientId) {
        fetchPatientData(patientId);
      } else {
        setErrorMessage('No patient selected. Please go back and choose a patient.');
      }
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
    }
  }, [patientId]);

 const fetchPatientData = async (id) => {
  try {
    const response = await fetch(`http://localhost:8082/api/patients/${id}`);
    const data = await response.json();
    setPatientData(data);
  } catch (error) {
    console.error('Failed to fetch patient data:', error);
    setErrorMessage('Failed to load patient information.');
  }
};


  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    router.push('/login');
  };

  if (isAuthorized === false || errorMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-xl text-lg font-semibold mb-6">
          {errorMessage}
        </div>
        <button
          onClick={() => router.push('/login')}
          className="bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-black font-semibold py-2 px-6 rounded-xl shadow-lg transition duration-300"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-500 px-4">
        Loading patient data...
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-4 md:px-8 py-6 ${outfit.className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
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
          <h1
            onClick={() => router.push('/doctor/homepage')}
            className="text-2xl sm:text-3xl font-extrabold text-blue-950 cursor-pointer"
          >
            Medica
          </h1>
        </div>

        <div className="flex items-center gap-2">
           <FontAwesomeIcon icon={faRightFromBracket} className="text-blue-950 w-5 h-5" />
          <button
            onClick={handleLogout}
            className="text-base sm:text-lg font-semibold text-gray-700 hover:text-red-600 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

<div className="w-full max-w-5xl mx-auto bg-white/90 backdrop-blur-md border border-white/40 rounded-3xl shadow-2xl">
  {/* Header Row */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between px-8 pt-8 pb-4 gap-4">
    <h2 className="text-3xl sm:text-4xl font-bold text-blue-950 text-center sm:text-left">
      {patientData.name}
    </h2>
      <Link href={`/doctor/addPatientVisit?id=${btoa(patientId)}`}>
      <button className="bg-blue-200 hover:bg-blue-300 text-blue-950 text-base sm:text-lg font-semibold px-5 py-3 rounded-xl shadow transition-all whitespace-nowrap cursor-pointer">
        Add New Visit
      </button>
    </Link>
  </div>


<div className="max-h-[70vh] overflow-y-auto px-8 pb-8 space-y-6">
  {[
    { label: 'Phone Number', value: patientData.phoneNumber },
    { label: 'Blood Type', value: patientData.bloodType },
    { label: 'History', value: patientData.history },
  ].map(({ label, value }, idx) => (
    <div key={idx}>
      <p className="text-xl sm:text-2xl font-semibold text-gray-800">{label}</p>
      <p className="text-lg sm:text-xl text-gray-600">{value || 'N/A'}</p>
    </div>
  ))}

  <div className="pt-8 flex justify-center">
    <Link href={`/doctor/patient-visits?id=${btoa(patientId)}`}>
      <button className="bg-blue-200 hover:bg-blue-300 text-blue-950 text-base sm:text-lg font-semibold px-5 py-3 rounded-xl shadow transition-all whitespace-nowrap cursor-pointer">
        All Previous Visits
      </button>
    </Link>
  </div>
</div>
</div>
  </div>
  );
}
