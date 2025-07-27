'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
  try {
    const response = await fetch('http://localhost:8082/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const text = await response.text();

    if (response.ok) {
      const roleMatch = text.match(/\[(ADMIN|DOCTOR|PHARMA_COMPANY)]/);
      const idMatch = text.match(/\[(\d+)]\s*$/);

      if (roleMatch && idMatch) {
        const role = roleMatch[1];
        const id = idMatch[1];

        localStorage.setItem('role', role);
        localStorage.setItem('id', id);

        if (role === 'ADMIN') {
          router.push('/admin/homepage');
        } else if (role === 'DOCTOR') {
          localStorage.setItem('doctor', JSON.stringify({ id }));
          router.push('/doctor/homepage');
        } else if (role === 'PHARMA_COMPANY') {
          localStorage.setItem('companyId', JSON.stringify({ id }));
          router.push('/pharmaCompany/Pharma-Dashboard');
        } else {
          setError('Unexpected role. Please contact support.');
        }
      } else {
        setError('Could not extract role or ID from response.');
      }
    } else {
      if (text === 'User not found.' || text === 'Incorrect password.') {
        setError('Incorrect email or password');
      } else {
        setError(text);
      }
    }
  } catch (err) {
    console.error(err);
    setError('Something went wrong. Please try again.');
  }
};

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-100 px-4 md:px-10 py-10">
      {/* SVG + Logo */}
      <div className="flex items-center gap-4 mb-10">
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
            className="text-3xl font-extrabold text-blue-950 tracking-tight cursor-pointer"
            onClick={() => router.push('/')}
          >
            Medica
          </h1>
          <p className="text-sm text-gray-600 font-medium">Welcome Back</p>
        </div>
      </div>

      {/* Login Box */}
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-md p-6 md:p-10 mt-24">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-950 mb-4">Login</h2>
        <p className="text-center text-lg text-gray-600 mb-13 font-medium">
          Smarter Healthcare, Better Decisions
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-8 mb-5"
        >
          <div>
            <label htmlFor="email" className="text-blue-950 text-lg font-semibold mb-4 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-14 border border-gray-300 rounded-xl px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="text-blue-950 text-lg font-semibold mb-2 block">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-14 border border-gray-300 rounded-xl px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              required
            />
          </div>

          {error && <p className="text-red-600 text-center font-semibold">{error}</p>}

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-64 h-14 bg-blue-300 hover:bg-blue-400 rounded-full text-black text-lg md:text-xl font-bold transition shadow cursor-pointer"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
