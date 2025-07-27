'use client';

import Image from "next/image";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Outfit } from 'next/font/google';
import Swal from 'sweetalert2';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function AddPatientVisit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const encodedId = searchParams.get('id');
  const patientId = encodedId ? atob(encodedId) : null;

  const [isAuthorized, setIsAuthorized] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [todayDate, setTodayDate] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [prescribedMedicine, setPrescribedMedicine] = useState('');
  const [outcome, setOutcome] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    const storedDoctor = localStorage.getItem('doctor');

    if (role === 'DOCTOR' && storedDoctor) {
      try {
        const parsedDoctor = JSON.parse(storedDoctor);
        if (parsedDoctor?.id) {
          setDoctorId(parsedDoctor.id);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          setErrorMessage('Invalid doctor data. Please login again.');
        }
      } catch {
        setIsAuthorized(false);
        setErrorMessage('Error reading doctor info. Please login again.');
      }
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientId || !doctorId) {
      Swal.fire('Error', 'Missing doctor or patient ID.', 'error');
      return;
    }

    const visitData = {
      patientId: Number(patientId),
      doctorId: Number(doctorId),
      visitDate: todayDate,
      diagnosis,
      symptoms,
      prescribedMedicine,
      treatmentEffect: outcome,
    };

    try {
      const response = await fetch('http://localhost:8082/api/visits/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData),
      });

      if (response.ok) {
        Swal.fire({
          title: 'Success',
          text: 'Visit added successfully!',
          icon: 'success',
          timer: 1800,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        setTimeout(() => {
          router.push(`/doctor/patient-info?id=${btoa(patientId)}`);
        }, 2000); 

    } 
  }
    
    catch (error) {
      console.error('Error adding visit:', error);
      Swal.fire('Error', 'Error adding visit. Check the console.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    router.push('/login');
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-200 text-red-600 font-bold text-xl px-4 text-center">
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow mb-4">
            {errorMessage}
          </div>
        )}
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-300 hover:bg-blue-400 text-black font-bold py-2 px-6 rounded-xl transition duration-300"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className={`${outfit.className} min-h-screen bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-4 md:px-10 py-8`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-3">
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
          <span
            onClick={() => router.push('/doctor/homepage')}
            className="text-2xl sm:text-3xl font-bold text-blue-950 cursor-pointer"
          >
            Medica
          </span>
        </div>

        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faRightFromBracket} className="text-blue-950 w-5 h-5" />
          <button
            onClick={handleLogout}
            className="text-lg sm:text-xl font-semibold text-blue-950 hover:text-red-600 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-bold text-blue-950 mb-10">Add Patient Visit</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-semibold text-blue-950 mb-1">Visit Date</label>
            <input
              type="date"
              value={todayDate}
              onChange={(e) => setTodayDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg h-12 px-4"
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-blue-950 mb-1">Diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis"
              className="w-full border border-gray-300 rounded-lg h-12 px-4"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-blue-950 mb-1">Symptoms</label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., Headache, Dizziness"
              className="w-full border border-gray-300 rounded-lg h-12 px-4"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-blue-950 mb-1">Prescribed Medicine</label>
            <input
              type="text"
              value={prescribedMedicine}
              onChange={(e) => setPrescribedMedicine(e.target.value)}
              placeholder="Enter prescribed medicine"
              className="w-full border border-gray-300 rounded-lg h-12 px-4"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-blue-950 mb-1">Treatment Effect</label>
          <input
            type="text"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="Enter treatment outcome"
            className="w-full border border-gray-300 rounded-lg h-12 px-4"
          />
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className="bg-blue-300 hover:bg-blue-400 text-black font-bold text-lg px-8 py-3 rounded-full shadow-lg transition cursor-pointer"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
