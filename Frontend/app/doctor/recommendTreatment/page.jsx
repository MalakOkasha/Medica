'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Outfit } from 'next/font/google';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

const SearchableDropdown = ({ label, options, value, onChange }) => {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState(options);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    setFiltered(
      options.filter((option) =>
        option.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, options]);

  return (
    <div className="relative">
      <label className="block text-blue-950 font-semibold text-lg mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setQuery(e.target.value);
          setShowOptions(true);
        }}
        onFocus={() => setShowOptions(true)}
        placeholder={`Search ${label.toLowerCase()}`}
        className="w-full border border-gray-300 rounded-lg h-12 px-4 focus:outline-blue-300"
      />
      {showOptions && (
        <ul className="absolute z-10 bg-white w-full mt-1 border rounded-lg shadow max-h-40 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((option, index) => (
              <li
                key={index}
                onClick={() => {
                  onChange(option);
                  setQuery(option);
                  setShowOptions(false);
                }}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
              >
                {option}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-400">No match</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default function RecommendedTreatment() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronic, setChronic] = useState('');
  const [recommendedMedicine, setRecommendedMedicine] = useState('');
  const [medicineDescription, setMedicineDescription] = useState('');

  const allergyTypes = ['None', 'Penicillin', 'Sulfa', 'Statins', 'NSAIDs'];
  const chronicPool = ['None', 'CKD', 'COPD', 'CAD', 'Obesity', 'Liver Disease'];
  const genderOptions = ['Male', 'Female'];
  const diagnoses = [
    'Asthma_mild',
    'Asthma_severe',
    'Bacterial Infection',
    'GERD_<=3wk',
    'GERD_>3wk',
    'Heart Failure_EF<40',
    'Heart Failure_EF>=40',
    'Hyperlipidemia_LDL<130',
    'Hyperlipidemia_LDL>=130',
    'Hypertension_<=50',
    'Hypertension_51-70',
    'Hypertension_>70',
    'Hypothyroidism',
    'Type 2 Diabetes_controlled',
    'Type 2 Diabetes_uncontrolled',
  ];

  useEffect(() => {
    const role = localStorage.getItem('role');
    const storedDoctor = localStorage.getItem('doctor');

    if (role === 'DOCTOR' && storedDoctor) {
      try {
        const parsedDoctor = JSON.parse(storedDoctor);
        if (parsedDoctor?.id) {
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

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('doctor');
    router.push('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRecommendedMedicine('');
    setMedicineDescription('');

    if (!age || !gender || !diagnosis || !allergies || !chronic) {
      setRecommendedMedicine('❗ Please fill in all the fields before submitting.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8083/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: Number(age),
          gender,
          diagnosis,
          allergies,
          chronic_conditions: chronic,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to get recommendation.');
      }

      const data = await response.json();
      const recommended = data.medicine;
      setRecommendedMedicine(recommended);

      try {
        const descResponse = await fetch(`http://localhost:8082/api/ingredients/description?name=${encodeURIComponent(recommended)}`);
        if (descResponse.ok) {
          const descriptionText = await descResponse.text();
          setMedicineDescription(descriptionText);
        } else {
          setMedicineDescription("No description available.");
        }
      } catch (err) {
        console.error(err);
        setMedicineDescription("Error fetching description.");
      }

    } catch (error) {
      console.error(error);
      setRecommendedMedicine(`❌ Error: ${error.message || 'Something went wrong'}`);
    }
  };

  if (isAuthorized === false) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-white text-red-600 font-bold text-xl px-4 text-center ${outfit.className}`}>
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
    <div className={`min-h-screen overflow-hidden bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-6 py-4 ${outfit.className}`}>
      <header className="flex items-center justify-between px-6 py-4 flex-none">
        <div className="flex items-center gap-4">
          <div className="bg-blue-200 p-2 rounded-full shadow-md animate-pulse">
            <svg width="45" height="45" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="47" height="47" rx="23.5" fill="#C6DEFD" />
              <path d="M34 24H30L27 33L21 15L18 24H14" stroke="#252B61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1
              onClick={() => router.push('/doctor/homepage')}
              className="text-3xl font-extrabold text-blue-950 tracking-tight cursor-pointer"
            >
              Medica
            </h1>
            <p className="text-sm text-gray-600 font-medium">Recommend Treatment</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <img src="/logout.png" alt="Logout" className="w-8 h-8" />
          <button
            onClick={handleLogout}
            className="text-base font-semibold text-gray-700 hover:text-red-600 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      <h2 className="text-4xl font-extrabold text-blue-950 mb-15 mt-5">Recommend Treatment</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-md">
        <div>
          <label className="block text-blue-950 font-semibold text-lg mb-1">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter age"
            className="w-full border border-gray-300 rounded-lg h-12 px-4 focus:outline-blue-300"
          />
        </div>

        <SearchableDropdown label="Diagnosis" options={diagnoses} value={diagnosis} onChange={setDiagnosis} />
        <SearchableDropdown label="Gender" options={genderOptions} value={gender} onChange={setGender} />
        <SearchableDropdown label="Allergies" options={allergyTypes} value={allergies} onChange={setAllergies} />
        <SearchableDropdown label="Chronic Conditions" options={chronicPool} value={chronic} onChange={setChronic} />

        <div className="md:col-span-2 mt-6 flex justify-center">
          <button
            type="submit"
            className="bg-blue-400 hover:bg-blue-500 text-white font-semibold px-10 py-3 rounded-full transition duration-300 cursor-pointer"
          >
            Recommend
          </button>
        </div>
      </form>

      {recommendedMedicine && (
        <div className="mt-10 text-center text-xl text-blue-950 font-semibold space-y-4">
          {recommendedMedicine.startsWith('❗') || recommendedMedicine.startsWith('❌') ? (
            <p className="text-red-600 text-lg">{recommendedMedicine}</p>
          ) : (
            <div>
              <div>
                <span className="text-2xl font-bold inline-block mb-2">Recommended Active Ingredient:</span>
                <div className="bg-white/80 px-4 py-2 rounded-xl shadow inline-block text-gray-800">
                  {recommendedMedicine}
                </div>
                <p className="text-base text-gray-700 max-w-2xl mx-auto italic mb-4">
                  ⚠️ This recommendation is generated by a machine learning model. It is intended to assist clinical decision-making and should be validated by the treating physician.
                </p>
              </div>
              <div className="mt-4 max-w-2xl mx-auto text-gray-700 text-base bg-white/80 p-4 rounded-xl shadow">
                <span className="font-bold">Description:</span>
                <p className="mt-1">{medicineDescription}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
