'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Outfit } from 'next/font/google';
import Swal from 'sweetalert2';

interface MedicineForm {
  name: string;
  substitute0: string;
  substitute1: string;
  use0: string;
  use1: string;
  use2: string;
  sideeffect0: string;
  sideeffect1: string;
  sideeffect2: string;
}

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function EditMedicinePage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<MedicineForm>({
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

  const [originalData, setOriginalData] = useState<MedicineForm>({ ...formData });

  const router = useRouter();
  const searchParams = useSearchParams();

  const encodedId = searchParams.get('id');
  let medicineId: string | null = null;

  try {
    medicineId = encodedId ? atob(encodedId) : null;
  } catch {
    Swal.fire('Error', 'Invalid medicine ID.', 'error');
    router.push('/pharmaCompany/Pharma-Dashboard');
  }

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'PHARMA_COMPANY') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
    }
  }, []);

  useEffect(() => {
    const storedCompany = JSON.parse(localStorage.getItem('companyId') || '{}');
    const companyId = storedCompany.id;

    if (!companyId || !medicineId) return;

    fetch(`http://localhost:8082/api/medicines/getMedicineById?companyId=${companyId}&medicineId=${medicineId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        const populated: MedicineForm = {
          name: data.name || '',
          substitute0: data.substitute0 || '',
          substitute1: data.substitute1 || '',
          use0: data.use0 || '',
          use1: data.use1 || '',
          use2: data.use2 || '',
          sideeffect0: data.sideeffect0 || '',
          sideeffect1: data.sideeffect1 || '',
          sideeffect2: data.sideeffect2 || '',
        };
        setFormData(populated);
        setOriginalData(populated);
      })
      .catch(() => {
        Swal.fire('Error', 'Failed to load medicine.', 'error');
      });
  }, [medicineId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const storedCompany = JSON.parse(localStorage.getItem('companyId') || '{}');
    const companyId = storedCompany.id;

    if (!companyId || !medicineId) return;

    const hasEmptyField = Object.values(formData).some((val) => val.trim() === '');
    if (hasEmptyField) {
      Swal.fire('Error', 'Please fill in all fields before saving.', 'error');
      return;
    }

    const isSame = Object.keys(formData).every(
      (key) => formData[key as keyof MedicineForm] === originalData[key as keyof MedicineForm]
    );
    if (isSame) {
      Swal.fire('Error', 'No changes detected.', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8082/api/medicines/update?companyId=${companyId}&medicineId=${medicineId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      const contentType = response.headers.get('Content-Type');
      const message = contentType?.includes('application/json')
        ? (await response.json()).message || 'Unknown response.'
        : await response.text();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: message || 'Medicine updated successfully!',
          showConfirmButton: false,
          timer: 2000,
        });
        router.push('/pharmaCompany/View-Dataset');
      } else {
        Swal.fire('Error', message || 'Update failed.', 'error');
      }
    } catch {
      Swal.fire('Error', 'Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-4 text-center ${outfit.className}`}>
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
    <div className={`h-screen flex flex-col bg-gradient-to-b from-white to-blue-100 font-sans ${outfit.className}`}>
      <div className="px-6 py-4 overflow-y-auto flex-grow">
        {/* Header */}
        <div className="flex items-center gap-4 mb-15">
          <div className="bg-blue-200 p-2 rounded-full shadow-md animate-pulse">
            <svg width="45" height="45" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="47" height="47" rx="23.5" fill="#C6DEFD" />
              <path d="M34 24H30L27 33L21 15L18 24H14" stroke="#252B61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight cursor-pointer" onClick={() => router.push('/pharmaCompany/Pharma-Dashboard')}>
              Medica
            </h1>
            <p className="text-sm text-gray-600 font-medium">Edit Medicine</p>
          </div>
        </div>

        {/* Form */}
        <div className="flex justify-center">
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 bg-white shadow-md rounded-2xl p-6">
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
            ] as [keyof MedicineForm, string][]).map(([key, label]) => (
              <div key={key}>
                <label className="block text-blue-950 text-lg font-semibold mb-1">{label}</label>
                <input
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="w-full h-12 border border-gray-300 rounded-xl px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-15">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-40 h-14 rounded-full font-bold text-black transition-transform duration-200 cursor-pointer ${
              loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-300 hover:bg-blue-400 hover:scale-105 shadow-md'
            }`}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
