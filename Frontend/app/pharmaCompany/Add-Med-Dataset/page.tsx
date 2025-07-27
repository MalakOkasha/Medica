'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
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

export default function AddMedicineDataset() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'PHARMA_COMPANY') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
    }
  }, []);

  const uploadFile = async (file: File) => {
    setFileName(file.name);

    const companyIdRaw = localStorage.getItem('companyId');
    if (!companyIdRaw) {
      Swal.fire('Error', 'Company ID not found. Please log in again.', 'error');
      router.push('/login');
      return;
    }

    const parsedCompany = JSON.parse(companyIdRaw);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', parsedCompany.id);

    try {
      const response = await fetch('http://localhost:8082/api/medicines/upload-dataset', {
        method: 'POST',
        body: formData,
      });

      const result = await response.text();

      if (result.startsWith('0 medicines added successfully')) {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: result,
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Uploaded Successful',
          text: result,
        });
      }
    } catch (err) {
      console.error('Upload failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Something went wrong while uploading your file.',
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('companyId');
    router.push('/login');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-red-600 font-bold text-xl px-4 text-center">
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow mb-4">
            {errorMessage}
          </div>
        )}
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
    <div className={`min-h-screen bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-6 py-12 overflow-auto ${outfit.className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-blue-200 p-2 rounded-full shadow-md animate-pulse">
            <svg width="45" height="45" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="47" height="47" rx="23.5" fill="#C6DEFD" />
              <path d="M34 24H30L27 33L21 15L18 24H14" stroke="#252B61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1
              className="text-3xl font-extrabold text-blue-950 cursor-pointer"
              onClick={() => router.push('/pharmaCompany/Pharma-Dashboard')}
            >
              Medica
            </h1>
            <p className="text-sm text-gray-600 font-medium">Upload Dataset</p>
          </div>
        </div>

       <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faRightFromBracket} className="text-blue-950 w-5 h-5" />
                 <button
                   onClick={handleLogout}
                   className="text-base font-semibold text-blue-950 hover:text-red-600 transition cursor-pointer"
                 >
                   Logout
                 </button>
               </div>
      </div>

      {/* Upload Box */}
      <div
        className={`border border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl bg-white/60 backdrop-blur-md shadow-xl p-10 flex flex-col items-center justify-center gap-6 w-full max-w-[900px] min-h-[600px] mx-auto transition-all duration-200 ${
          isDragging ? 'bg-blue-50 border-blue-400' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <h3 className="text-2xl font-bold text-center text-blue-900">Select a file or drag and drop here</h3>

        <FontAwesomeIcon icon={faCloudArrowUp} className="text-black text-[100px]" />

        <p className="text-lg text-gray-700">Upload a .csv file</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#1e3778] hover:bg-[#000000] text-white font-bold rounded-full px-9 py-4 hover:scale-105 transition-transform duration-200 cursor-pointer"
        >
          Browse
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileSelect}
        />
        {fileName && (
          <p className="text-sm text-gray-600 mt-2">
            Selected: <strong>{fileName}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
