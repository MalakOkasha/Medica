'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Outfit } from 'next/font/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function AdminLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); 


  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'ADMIN') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetch('http://localhost:8082/api/action-logs')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch logs');
          return res.json();
        })
        .then((data) => setLogs(data))
        .catch((err) => setErrorMessage(err.message));
    }
  }, [isAuthorized]);

  const handleLogout = () => {
    localStorage.removeItem('role');
    router.push('/login');
  };

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-4 text-center">
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-xl text-lg font-semibold mb-6">
            {errorMessage}
          </div>
        )}
        <button
          onClick={() => router.push('/login')}
          className="bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-black font-semibold py-2 px-6 rounded-xl shadow-lg transition duration-300 cursor-pointer"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-6 py-10 overflow-auto ${outfit.className}`}>
      {/* Header */}
      <header className="flex items-center justify-between px-2 pb-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-200 p-2 rounded-full shadow-md animate-pulse">
            <svg width="45" height="45" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="47" height="47" rx="23.5" fill="#C6DEFD" />
              <path d="M34 24H30L27 33L21 15L18 24H14" stroke="#252B61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-blue-950 tracking-tight cursor-pointer" onClick={() => router.push('/admin/homepage')}>
              Medica
            </h1>
            <p className="text-sm text-gray-600 font-medium">User Activity Logs</p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          {/* Logs Icon */}
          <div className="flex items-center gap-1 hover:text-blue-700 ">
            <FontAwesomeIcon icon={faClipboardList} className="text-blue-950 w-5 h-5" title="Logs" />
            <button
              onClick={() => router.push('/admin/logs')}
              className="text-base font-semibold text-blue-700 hover:text-blue-700 transition"
            >
              Logs
            </button>
          </div>

          {/* Logout */}
          <div className="flex items-center gap-1">
            <FontAwesomeIcon icon={faRightFromBracket} className="text-blue-950 w-5 h-5" />
            <button
              onClick={handleLogout}
              className="text-base font-semibold text-gray-700 hover:text-red-600 transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 shadow">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-end mb-4">
        <label className="text-blue-950 font-medium mr-2">Sort by:</label>
        <select
          className="border border-blue-300 rounded-md px-3 py-1 text-sm text-blue-900 shadow-sm cursor-pointer"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">Most Recent</option>
          <option value="asc">Oldest</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-auto">
        <table className="min-w-full table-auto text-left text-blue-950">
          <thead className="bg-blue-200 text-xl font-semibold">
            <tr>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4">Timestamp</th>
            </tr>
          </thead>
          <tbody>
          {[...logs]
            .sort((a, b) => {
              const timeA = new Date(a.timestamp).getTime();
              const timeB = new Date(b.timestamp).getTime();
              return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
            })
            .map((log) => (
            <tr key={log.id} className="border-b border-blue-100 hover:bg-blue-50 transition duration-200">
              <td className="px-6 py-4">{log.username}</td>
              <td className="px-6 py-4">{log.action}</td>
              <td className="px-6 py-4">{log.details}</td>
              <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>

        </table>
      </div>
    </div>
  );
}
