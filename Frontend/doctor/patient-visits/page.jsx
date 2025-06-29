'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Outfit } from 'next/font/google';
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

export default function PatientVisitsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encodedId = searchParams.get('id');
  const patientId = encodedId ? atob(encodedId) : null;

  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [originalVisitsAsc, setOriginalVisitsAsc] = useState([]); 
  const [visits, setVisits] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'DOCTOR') {
      setIsAuthorized(true);
      if (patientId) fetchVisits(patientId);
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
    }
  }, [patientId]);

const fetchVisits = async (id) => {
  try {
    const res = await fetch(`http://localhost:8082/api/visits/${id}`);

    const contentType = res.headers.get('content-type');

    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();

      if (Array.isArray(data)) {
        const sortedAsc = data.sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate));
        setOriginalVisitsAsc(sortedAsc);
        setVisits([...sortedAsc].reverse());
      } else {
        setOriginalVisitsAsc([]);
        setVisits([]);
      }
    } else {
      const text = await res.text();
      console.warn('Non-JSON response:', text);
      setOriginalVisitsAsc([]);
      setVisits([]);
    }
  } catch (err) {
    console.error('Fetch error:', err);
    setOriginalVisitsAsc([]);
    setVisits([]);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('role');
    router.push('/login');
  };

  const toggleCard = (index) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
    const sorted = value === 'desc'
      ? [...originalVisitsAsc].reverse()
      : [...originalVisitsAsc];
    setVisits(sorted);
  };

  const getVisitNumber = (visit) => {
    return originalVisitsAsc.findIndex(v =>
      v.visitDate === visit.visitDate &&
      v.diagnosis === visit.diagnosis &&
      v.symptoms === visit.symptoms
    ) + 1;
  };

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-red-600 font-bold text-xl px-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow mb-4">
          {errorMessage}
        </div>
        <button
          onClick={() => router.push('/login')}
          className="bg-[#C6DEFD] hover:bg-[#a0c4f5] text-black font-bold py-2 px-4 rounded transition duration-300"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-tr from-blue-100 via-white to-blue-200 min-h-screen w-full px-6 py-8 ${outfit.className}`}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
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
          <div>
      <h1
            onClick={() => router.push('/doctor/homepage')}
            className="text-2xl sm:text-3xl font-extrabold text-blue-950 cursor-pointer"
          >
            Medica
          </h1>           
           <p className="text-sm text-gray-600 font-medium">Patient Visit History</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faRightFromBracket} className="text-blue-950 w-5 h-5" />       
          <button
            onClick={handleLogout}
            className="text-base font-semibold text-gray-700 hover:text-red-600 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

    <div className="mb-6 ml-7">
      <button
        onClick={() => router.push(`/doctor/patient-info?id=${encodedId}`)}
        className="bg-blue-200 hover:bg-blue-300 text-blue-950 font-semibold px-4 py-2 rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
      >
        <span>←</span>
        <span>Back to Patient Info</span>
      </button>
    </div>


      {/* Title */}
      <h2 className="text-4xl font-bold text-blue-950 mt-10 mb-6 text-center">Patient Visits</h2>

      {/* Sort Dropdown */}
      <div className="flex justify-end max-w-xl mx-auto mb-6 cursor-pointer">
        <select
          value={sortOrder}
          onChange={(e) => handleSortChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 shadow-sm cursor-pointer"
        >
          <option value="desc">Most Recent First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

  
      {/* Visit Cards */}
        <div className="grid grid-cols-1 gap-5 w-full max-w-xl mx-auto">
        {visits.length === 0 ? (
          <div className="text-center text-gray-500 text-lg font-medium py-20">
            No visits for this user.
          </div>
        ) : (
          visits.map((visit, index) => (
            <div
              key={index}
              onClick={() => toggleCard(index)}
              className={`p-6 border rounded-2xl shadow-lg transition duration-200 cursor-pointer ${
                expandedIndex === index ? 'bg-blue-100' : 'bg-white'
              }`}
            >
              <h3 className="text-xl font-bold text-blue-900">Visit {getVisitNumber(visit)}</h3>
              <p className="text-base text-gray-600">
                {new Date(visit.visitDate).toLocaleDateString()}
              </p>

              {expandedIndex === index && (
                <div className="mt-4 space-y-2 text-[16px] text-gray-700">
                  <p><strong>Diagnosis:</strong> {visit.diagnosis}</p>
                  <p><strong>Symptoms:</strong> {visit.symptoms}</p>
                  <p><strong>Medicine:</strong> {visit.prescribedMedicine}</p>
                  <p><strong>Treatment:</strong> {visit.treatmentEffect}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
