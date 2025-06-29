'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Outfit } from 'next/font/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

const labelMap = {
  Blood_Pressure_Systolic_BP: 'Systolic Blood Pressure',
  HbA1c: 'HbA1c',
  LDL_Cholesterol: 'LDL Cholesterol Level',
  BNP: 'BNP',
  Endoscopy_Result: 'Endoscopy Result',
  TSH: 'TSH Level'
};

const InputField = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-blue-950 font-semibold text-lg mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={`Enter ${label.toLowerCase()}`}
      className="w-full border border-gray-300 rounded-lg h-12 px-4 focus:outline-blue-300"
    />
  </div>
);

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

export default function MedicineSuitability() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronic, setChronic] = useState('');
  const [medicine, setMedicine] = useState('');
  const [testInputs, setTestInputs] = useState({});
  const [smoking, setSmoking] = useState('');
  const [severity, setSeverity] = useState('');
  const [predictionResult, setPredictionResult] = useState('');
  const [improvementProbability, setImprovementProbability] = useState(null);

  const allTestFields = [
    'Blood_Pressure_Systolic_BP',
    'HbA1c',
    'LDL_Cholesterol',
    'BNP',
    'Endoscopy_Result',
    'TSH'
  ];

  const fieldMap = {
    'Hypertension': ['Blood_Pressure_Systolic_BP'],
    'Type 2 Diabetes': ['HbA1c'],
    'Hyperlipidemia': ['LDL_Cholesterol'],
    'Heart Failure': ['BNP'],
    'GERD': ['Endoscopy_Result'],
    'Hypothyroidism': ['TSH']
  };

  const allergyTypes = ['None', 'Penicillin', 'Sulfa', 'Statins', 'NSAIDs'];
  const chronicPool = ['None', 'CKD', 'COPD', 'CAD', 'Obesity', 'Liver Disease'];
  const genderOptions = ['Male', 'Female'];
  const medicineOptions = [
    'Lisinopril', 'Amlodipine', 'Hydrochlorothiazide', 'Metformin',
    'Insulin', 'Atorvastatin', 'Simvastatin', 'Furosemide',
    'Carvedilol', 'Omeprazole', 'Pantoprazole', 'Levothyroxine'
  ];

  useEffect(() => {
    const role = localStorage.getItem('role');
    const storedDoctor = localStorage.getItem('doctor');

    if (role === 'DOCTOR' && storedDoctor) {
      try {
        const parsedDoctor = JSON.parse(storedDoctor);
        setIsAuthorized(!!parsedDoctor?.id);
      } catch {
        setIsAuthorized(false);
        setErrorMessage('Error reading doctor info. Please login again.');
      }
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
    }
  }, []);

  useEffect(() => {
    const resetFields = {};
    allTestFields.forEach((key) => {
      resetFields[key] = '';
    });
    setTestInputs(resetFields);
  }, [diagnosis]);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('doctor');
    router.push('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const relevantFields = fieldMap[diagnosis] || [];

    const cleanedTestInputs = allTestFields.reduce((acc, key) => {
      const value = testInputs[key];
      if (relevantFields.includes(key)) {
        const parsed = parseFloat(value);
        acc[key] = value === '' ? null : isNaN(parsed) ? null : parsed;
      } else {
        acc[key] = null;
      }
      return acc;
    }, {});

    const payload = {
      age: Number(age),
      gender,
      diagnosis,
      medicine,
      allergies,
      chronic_conditions: chronic,
      severity: severity === 'Mild' ? 0 : severity === 'Moderate' ? 1 : 2,
      smoking: smoking === 'Yes' ? 1 : 0,
      ...cleanedTestInputs
    };

    try {
      const response = await fetch('http://localhost:8083/predictImprovement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Prediction failed.');

      setPredictionResult(data.prediction || 'N/A');
      setImprovementProbability(
        data.improvement_probability !== undefined
          ? (data.improvement_probability * 100).toFixed(2)
          : null
      );
    } catch (error) {
      setPredictionResult(`❌ Error: ${error.message || 'Something went wrong'}`);
      setImprovementProbability(null);
    }
  };

  const renderTestInputs = () => {
    return (fieldMap[diagnosis] || []).map((field) => (
      <InputField
        key={field}
        label={labelMap[field]}
        name={field}
        value={testInputs[field] || ''}
        onChange={(e) =>
          setTestInputs((prev) => ({
            ...prev,
            [field]: e.target.value
          }))
        }
      />
    ));
  };

  if (isAuthorized === false) {
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
            <h1 onClick={() => router.push('/doctor/homepage')} className="text-3xl font-extrabold text-blue-950 tracking-tight cursor-pointer">
              Medica
            </h1>
            <p className="text-sm text-gray-600 font-medium">Check Medicine Suitability</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faRightFromBracket} className="text-blue-950 w-5 h-5" />
          <button onClick={handleLogout} className="text-base font-semibold text-blue-950 hover:text-red-600 transition cursor-pointer">
            Logout
          </button>
        </div>
      </header>

      <h2 className="text-4xl font-extrabold text-blue-950 mb-6 mt-3">Check Medicine Suitability</h2>

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

        <SearchableDropdown label="Gender" options={genderOptions} value={gender} onChange={setGender} />
        <SearchableDropdown label="Diagnosis" options={Object.keys(fieldMap)} value={diagnosis} onChange={setDiagnosis} />
        <SearchableDropdown label="Active Ingredient" options={medicineOptions} value={medicine} onChange={setMedicine} />
        <SearchableDropdown label="Allergies" options={allergyTypes} value={allergies} onChange={setAllergies} />
        <SearchableDropdown label="Chronic Conditions" options={chronicPool} value={chronic} onChange={setChronic} />

        <div>
          <label className="block text-blue-950 font-semibold text-lg mb-1">Smoking</label>
          <select
            value={smoking}
            onChange={(e) => setSmoking(e.target.value)}
            className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-white text-gray-800"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block text-blue-950 font-semibold text-lg mb-1">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full border border-gray-300 rounded-lg h-12 px-4 bg-white text-gray-800"
          >
            <option value="">Select Severity</option>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderTestInputs()}
        </div>

        <div className="md:col-span-2 mt-6 flex justify-center">
          <button type="submit" className="bg-blue-400 hover:bg-blue-500 text-white font-semibold px-10 py-3 rounded-full transition duration-300 cursor-pointer">
            Check Suitability
          </button>
        </div>
      </form>

      {predictionResult && (
        <div className="mt-10 text-center text-xl text-blue-950 font-semibold space-y-4">
          {predictionResult.startsWith('❌') ? (
            <p className="text-red-600 text-lg">{predictionResult}</p>
          ) : (
            <div>
              <div>
                <span className="text-2xl font-bold inline-block mb-0">Prediction:</span>
                <div className={`bg-white/80 px-4 py-2 rounded-xl shadow inline-block uppercase font-semibold ${predictionResult === 'Improved' ? 'text-green-600' : 'text-red-600'}`}>
                  {predictionResult === 'Improved' ? 'Improvement' : 'No Improvement'}
                </div>
              </div>
              {improvementProbability !== null && (
                <div className="mt-4 max-w-2xl mx-auto text-gray-700 text-base bg-white/80 p-4 rounded-xl shadow">
                  <span className="font-bold">Improvement Probability:</span>
                  <p className="mt-1">{improvementProbability}%</p>
                </div>
              )}
              <p className="text-base text-gray-700 max-w-2xl mx-auto italic mb-4">
                ⚠️ This recommendation is generated by a machine learning model. It is intended to assist clinical decision-making and should be validated by the treating physician.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
