'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const RegisterPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-6 py-12 flex flex-col items-center">
      
      {/* Header Section */}
      <header className="w-full max-w-[1600px] px-6 py-4 flex justify-between items-center">
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
            <h1  onClick={() => router.push('/')} className="text-3xl font-extrabold text-gray-900 tracking-tight cursor-pointer">Medica</h1>
            <p className="text-sm text-gray-600 font-medium">Your trusted care companion</p>
          </div>
        </div>
      </header>

      {/* Body Section */}
      <section className="max-w-3xl mt-16 bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-md text-center">
        <h2 className="text-5xl font-extrabold text-blue-950 mb-8">Register</h2>
        <p className="text-xl text-gray-800 leading-8">
          To complete your registration, please send us the necessary documents to verify that you are a licensed doctor or a registered pharmaceutical company.
          <br /><br />
          Kindly email your verification documents to:
          <br />
          📧 <span className="font-semibold text-black">medicaAdmins@gmail.com</span>
          <br /><br />
          Once your identity is verified, we will create your account and send your login credentials to the email you provided.
        </p>
      </section>

      {/* Go Back Button */}
      <button
        onClick={() => router.push('/')}
        className="mt-8 bg-blue-400 hover:bg-blue-500 text-white font-semibold px-10 py-3 rounded-full shadow-md transition duration-300 cursor-pointer"
      >
        Go Back
      </button>
    </div>
  );
};

export default RegisterPage;
