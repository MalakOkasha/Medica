'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Outfit } from 'next/font/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPenToSquare,
  faTrashArrowUp,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

type Medicine = {
  id: number;
  name: string;
  use0?: string;
  use1?: string;
  use2?: string;
  sideeffect0?: string;
  sideeffect1?: string;
  sideeffect2?: string;
};

export default function CompanyMedicinesPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [medicines, setMedicines] = useState<Medicine[] | null>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [companyId, setCompanyId] = useState<number | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'PHARMA_COMPANY') {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
      return;
    }

    setIsAuthorized(true);
    const storedCompanyId = localStorage.getItem('companyId');
    if (!storedCompanyId) {
      router.push('/login');
      return;
    }

    const parsedCompany = JSON.parse(storedCompanyId || '{}');
    const parsedId = parsedCompany?.id;

    if (!parsedId) {
      router.push('/login');
      return;
    }

    setCompanyId(parsedId);

    fetch(`http://localhost:8082/api/medicines/by-company/${parsedId}`)
      .then(async (res) => {
        try {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setMedicines(data);
          } else {
            setMedicines([]);
          }
        } catch {
          setMedicines(null);
        } finally {
          setLoading(false);
        }
      })
      .catch(() => {
        setMedicines(null);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('companyId');
    router.push('/login');
  };

  const handleEdit = (id: number) => {
    const encodedId = btoa(id.toString());
    router.push(`/pharmaCompany/Edit-Medicine?id=${encodedId}`);
  };

  const handleDelete = (id: number) => {
    if (companyId === null) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will delete the medicine.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:8082/api/medicines/delete?companyId=${companyId}&medicineId=${id}`, {
          method: 'DELETE',
        })
          .then((res) => {
            if (!res.ok) throw new Error('Delete failed');
            setMedicines((prev) => (prev ? prev.filter((m) => m.id !== id) : []));
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The medicine has been deleted.',
              showConfirmButton: false,
              timer: 2000,
            });
          })
          .catch(() => {
            Swal.fire('Error', 'Failed to delete medicine.', 'error');
          });
      }
    });
  };

  if (!isAuthorized) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-100 px-4 text-center ${outfit.className}`}>
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow mb-4 text-lg font-semibold">
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
    <div className={`min-h-screen flex flex-col justify-between bg-gradient-to-b from-white to-blue-100 ${outfit.className}`}>
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => router.push('/pharmaCompany/Pharma-Dashboard')}
          >
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
              <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight">Medica</h1>
              <p className="text-md font-medium text-gray-500">View & Manage Dataset</p>
            </div>
          </div>

          <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} className="text-blue-950 w-5 h-5" />
            <button className="text-base font-semibold text-blue-950 hover:text-red-600 transition cursor-pointer">
              Logout
            </button>
          </div>
        </div>

        {/* Add Medicine Button */}
        <div className="w-full flex justify-end pr-4 mb-4">
          <button
            onClick={() => router.push('/pharmaCompany/Add-Medicine')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold px-5 py-3 rounded-xl shadow-md transition duration-300 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Medicine
          </button>
        </div>

        {/* Table Header */}
        <div className="flex bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl shadow-md px-6 py-4 mb-5">
          {[
            'Name',
            'Use 1',
            'Use 2',
            'Use 3',
            'Side Effect 1',
            'Side Effect 2',
            'Side Effect 3',
            'Edit',
            'Delete',
          ].map((label, index) => (
            <div key={index} className="flex-1 text-blue-950 text-lg font-bold text-center">
              {label}
            </div>
          ))}
        </div>

        {/* Table Rows */}
        <div className="flex flex-col gap-3 mb-10">
          {loading ? (
            <div className="w-full h-14 flex items-center justify-center bg-white/80 rounded-xl shadow text-black text-xl font-medium">
              Loading medicines...
            </div>
          ) : medicines === null ? (
            <div className="w-full h-14 flex items-center justify-center bg-white/80 rounded-xl shadow text-red-600 text-xl font-medium">
              Something went wrong while loading medicines. Please try again later.
            </div>
          ) : medicines.length === 0 ? (
            <div className="w-full h-14 flex items-center justify-center bg-white/80 rounded-xl shadow text-black text-xl font-medium">
              No medicine data available for this company.
            </div>
          ) : (
            medicines.map((medicine) => (
              <div
                key={medicine.id}
                className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl shadow px-6 py-4 flex items-center"
              >
                {[
                  medicine.name,
                  medicine.use0,
                  medicine.use1,
                  medicine.use2,
                  medicine.sideeffect0,
                  medicine.sideeffect1,
                  medicine.sideeffect2,
                ].map((value, index) => (
                  <div
                    key={index}
                    className="flex-1 text-black text-base font-medium text-center"
                  >
                    {value || '-'}
                  </div>
                ))}

                <div className="flex-1 text-center">
                  <button
                    onClick={() => handleEdit(medicine.id)}
                    className="text-blue-600 hover:text-blue-800 transition text-lg cursor-pointer"
                    title="Edit"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                </div>

                <div className="flex-1 text-center">
                  <button
                    onClick={() => handleDelete(medicine.id)}
                    className="text-red-600 hover:text-red-800 transition text-lg cursor-pointer"
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrashArrowUp} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
