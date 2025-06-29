'use client';

import { useState, useEffect } from 'react';
import { Outfit } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function CreatePatientPage() {
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    bloodType: '',
    phoneNumber: '',
    age: '',
    history: ''
  });
  const [doctorId, setDoctorId] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'DOCTOR') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
    }

    const storedDoctor = JSON.parse(localStorage.getItem('doctor'));
    if (storedDoctor?.id) {
      setDoctorId(storedDoctor.id);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId) {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized',
        text: 'Doctor not logged in.',
      });
      return;
    }

    const payload = {
      ...formData,
      age: Number(formData.age),
      doctor: { id: doctorId },
    };

    try {
      const response = await fetch('http://localhost:8082/api/patients/addpatient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create patient.');
      await response.json();

      Swal.fire({
      icon: 'success',
      title: 'Patient Created',
      text: 'Patient has been successfully created!',
      timer: 1800,
      showConfirmButton: false,
      timerProgressBar: true,
    }).then(() => {
      router.push('/doctor/patientOptions');
    });


      setFormData({
        name: '',
        gender: '',
        bloodType: '',
        phoneNumber: '',
        age: '',
        history: ''
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong while creating the patient.',
      });
    }
  };

  if (isAuthorized === false) {
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

  if (isAuthorized === null) return null;

  return (
    <main className={`${outfit.className} bg-gradient-to-tr from-blue-100 via-white to-blue-200 min-h-screen py-12 px-6 flex flex-col items-center`}>
   <header className="flex items-center justify-between px-6 py-4 flex-none w-full">
  {/* Logo + Greeting */}  
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
        className="text-3xl font-extrabold  text-blue-950 tracking-tight cursor-pointer"
      >
        Medica
      </h1>
      <p className="text-sm text-gray-600 font-medium">Create Patient</p>
    </div>
  </div>

  <div className="flex items-center gap-2">
   <FontAwesomeIcon icon={faRightFromBracket} className="text-blue-950 w-5 h-5" />
    <button
      onClick={() => {
        localStorage.removeItem('role');
        router.push('/login');
      }}
      className="text-base font-semibold text-blue-950 hover:text-red-600 transition cursor-pointer"
    >
      Logout
    </button>
  </div>
</header>


      {/* Title */}
      <h2 className="text-4xl font-extrabold text-blue-950 mb-15">Create Patient</h2>
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-5xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InputField label="Name" name="name" value={formData.name} onChange={handleChange} />
          <SelectField
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={['Male', 'Female']}
          />
          <InputField label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
          <InputField label="Age" name="age" value={formData.age} onChange={handleChange} />
          <InputField label="History" name="history" value={formData.history} onChange={handleChange} />

          <SelectField
            label="Blood Type"
            name="bloodType"
            value={formData.bloodType}
            onChange={handleChange}
            options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
          />

        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className="bg-blue-300 hover:bg-blue-400 text-black text-lg font-bold px-10 py-3 rounded-full shadow-lg transition cursor-pointer"
          >
            Submit
          </button>
        </div>
      </form>
    </main>
  );
}

function InputField({ label, name, value, onChange }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-blue-950 text-lg font-semibold">{label}</label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        type="text"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-blue-950 text-lg font-semibold">{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <option value="">Select {label}</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
