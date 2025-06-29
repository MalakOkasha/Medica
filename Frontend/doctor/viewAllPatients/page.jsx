'use client';

import Link from 'next/link';
import { Outfit } from 'next/font/google';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

export default function ViewAllPatients() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem('role');
    const doctorId = localStorage.getItem('id');

    if (role === 'DOCTOR' && doctorId) {
      setIsAuthorized(true);

      fetch(`http://localhost:8082/api/patients/assigned?doctorId=${doctorId}`)
        .then((res) => res.json())
        .then((data) => {
          setPatients(data);
          setFiltered(data);
        })
        .catch((err) => console.error('Error fetching patients:', err));
    } else {
      setErrorMessage("You can't access this page. Please login first.");
      setIsAuthorized(false);
    }
  }, []);

  useEffect(() => {
    const query = search.toLowerCase();
    const filteredResults = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.phoneNumber?.toLowerCase().includes(query)
    );
    setFiltered(filteredResults);
  }, [search, patients]);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    router.push('/login');
  };

  if (isAuthorized === false) {
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

  return (
    <div className={`min-h-screen w-full bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-6 py-8 ${outfit.className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
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
          <h1 onClick={() => router.push('/doctor/homepage')} className="text-3xl font-extrabold text-blue-950 cursor-pointer">
            Medica
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faRightFromBracket} className="text-blue-950 w-5 h-5" />
          <button onClick={handleLogout} className="text-base font-semibold text-blue-950 hover:text-red-600 transition cursor-pointer">
            Logout
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 w-full max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Search by name or phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-8 w-full px-5 py-3 rounded-xl border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Table Header */}
      <div className="w-full max-w-5xl mx-auto bg-blue-300 rounded-2xl flex justify-between px-6 py-4 mb-4 shadow">
        <div className="w-1/2 text-center text-blue-950 text-xl font-bold">Name</div>
        <div className="w-1/2 text-center text-blue-950 text-xl font-bold">Phone Number</div>
      </div>

      {/* Table Rows */}
      <div className="flex flex-col items-center gap-3 w-full max-w-5xl mx-auto">
        {filtered.length === 0 && (
          <p className="text-gray-600 text-lg mt-6">No patients found.</p>
        )}

        {filtered.map((patient) => (
          <div
            key={patient.id}
            onClick={() => {
              const encodedId = btoa(patient.id.toString());
              router.push(`/doctor/patient-info?id=${encodedId}`);
            }}
            className="w-full flex justify-between items-center bg-white hover:bg-blue-50 cursor-pointer px-6 py-4 rounded-xl shadow transition duration-200"
          >
            <div className="w-1/2 text-center text-black text-lg font-medium capitalize">
              {patient.name}
            </div>
            <div className="w-1/2 text-center text-black text-lg font-medium">
              {patient.phoneNumber || 'N/A'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
