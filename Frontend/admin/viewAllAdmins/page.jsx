'use client';
import Link from 'next/link';
import { Outfit } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserDoctor, faUserTie, faHouseMedical } from '@fortawesome/free-solid-svg-icons';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import {
  faMagnifyingGlass,
  faPills,
  faUserInjured,
  faIndustry,
  faRobot,
} from '@fortawesome/free-solid-svg-icons';


const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

const encodeId = (id) => {
  return Buffer.from(id.toString()).toString('base64');
};

export default function ViewAllAdmins() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'ADMIN') {
      setIsAuthorized(true);
      fetch('http://localhost:8082/api/auth/admins')
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(text || 'Error loading admin data');
            });
          }
          return res.json();
        })
        .then((data) => {
          setAdmins(data);
          setLoading(false);
        })
        .catch((error) => {
          setErrorMessage(error.message || 'Error loading admin data');
          setLoading(false);
        });
    } else {
      setIsAuthorized(false);
      setErrorMessage("You can't access this page. Please login first.");
      setLoading(false);
    }
  }, []);

  const handleDelete = (id) => {
  const adminUserId = localStorage.getItem("id");

  Swal.fire({
    title: 'Are you sure?',
    text: 'This action will delete the admin permanently.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`http://localhost:8082/api/auth/admin/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'adminUserId': adminUserId
        }
      })
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(text || 'Failed to delete admin');
            });
          }
          return res.text();
        })
        .then((message) => {
          setAdmins((prev) => prev.filter((admin) => admin.id !== id));
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: message,
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true,
          });
        })
        .catch((error) => {
          Swal.fire('Error!', error.message || 'Something went wrong while deleting.', 'error');
        });
    }
  });
};


  const handleEdit = (id) => {
     const encodedId = encodeId(id);
    router.push(`/admin/editAdmin?id=${encodedId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    router.push('/login');
  };

  const filteredAdmins = admins.filter((admin) =>
    admin.fullName.toLowerCase().includes(search.toLowerCase()) ||
    admin.email.toLowerCase().includes(search.toLowerCase())
  );

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
          className="bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-black font-semibold py-2 px-6 rounded-xl shadow-lg transition duration-300"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Checking authorization...
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-blue-100 px-4 py-6 ${outfit.className}`}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
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
              className="text-3xl font-extrabold text-blue-950 tracking-tight cursor-pointer"
              onClick={() => router.push('/admin/homepage')}
            >
              Medica
            </h1>
            <p className="text-sm text-gray-600 font-medium">View all Admins</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faRightFromBracket} className="text-blue-950 w-5 h-5" />
          <button
            onClick={handleLogout}
            className="text-base font-semibold text-gray-700 hover:text-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="relative w-full mt-6 mb-6 px-10">
        {/* Search Bar */}
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full max-w-md px-5 py-3 rounded-xl shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <button
            onClick={() => router.push('/admin/createAdmin')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold px-5 py-3 rounded-xl shadow-md transition duration-300 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Admin
          </button>
        </div>
      </div>


      {/* Table Header */}
      <div className="hidden md:flex bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl shadow-md px-6 py-4 mb-3">
        <div className="flex-1 text-blue-950 text-lg font-bold">Full Name</div>
        <div className="flex-1 text-blue-950 text-lg font-bold pl-3">Contact Info</div>
        <div className="flex-1 text-blue-950 text-lg font-bold pl-7">Email</div>
        <div className="w-[80px] text-blue-950 text-lg font-bold text-center">Edit</div>
        <div className="w-[80px] text-blue-950 text-lg font-bold text-center">Delete</div>
      </div>

      {/* Table Rows */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-10 text-lg font-semibold">Loading...</div>
        ) : (
          filteredAdmins.map((admin) => (
            <div
              key={admin.id}
              className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl shadow px-6 py-4 flex flex-col md:flex-row gap-2 md:gap-6 items-start md:items-center"
            >
              <div className="flex-1 text-black text-base md:text-lg font-medium">{admin.fullName}</div>
              <div className="flex-1 text-black text-base md:text-lg font-medium">{admin.contactInfo}</div>
              <div className="flex-1 text-black text-base md:text-lg font-medium">{admin.email}</div>

              <button
                onClick={() => handleEdit(admin.id)}
                className="w-[36px] text-blue-600 font-semibold hover:underline text-base text-center cursor-pointer"
              >
                Edit
              </button>
              <div
                onClick={() => handleDelete(admin.id)}
                className="w-[80px] text-red-600 font-semibold cursor-pointer text-base text-center"
              >
                Delete
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
