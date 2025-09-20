import React, { useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Home,
} from "lucide-react";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  nic: string;
  phone: string;
  address: string;
  role: string;
  gender: string;
  age: string;
  smoking: boolean;
  alcoholic: boolean;
  cleanlinessLevel: string;
  noiseTolerance: string;
  sleepingHabit: string;
  socialBehavior: string;
  preferredRoomType: string;
  preferredEnvironment: string;
  foodAllergies: string;
  medicalConditions: string;
}

function Register() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    nic: "",
    phone: "",
    address: "",
    role: "Tenant",
    gender: "",
    age: "",
    smoking: false,
    alcoholic: false,
    cleanlinessLevel: "Medium",
    noiseTolerance: "Medium",
    sleepingHabit: "Early sleeper",
    socialBehavior: "Balanced",
    preferredRoomType: "Single",
    preferredEnvironment: "Quiet",
    foodAllergies: "",
    medicalConditions: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: any = {};

    // Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (!/^[A-Za-z ]+$/.test(formData.fullName)) {
      newErrors.fullName = "Only letters and spaces allowed";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Password must be 8+ chars with uppercase, number & special character";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digit number";
    }

    // NIC validation
    if (!formData.nic.trim()) {
      newErrors.nic = "NIC is required";
    } else if (formData.nic.length < 9) {
      newErrors.nic = "NIC must be at least 9 characters";
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.length < 5) {
      newErrors.address = "Address too short";
    }

    // Age validation for tenants
    if (formData.role === "Tenant") {
      if (!formData.age.trim()) {
        newErrors.age = "Age is required";
      } else if (Number(formData.age) < 18 || Number(formData.age) > 100) {
        newErrors.age = "Age must be between 18 and 100";
      }

      // Gender validation
      if (!formData.gender) {
        newErrors.gender = "Gender is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "radio") {
      // Handle radio buttons for smoking and alcoholic
      if (name === "smoking" || name === "alcoholic") {
        setFormData({ ...formData, [name]: value === "true" });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting data:", formData);

      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        }
      );

      alert("Registration successful!");
      console.log("Response:", res.data);

      // Reset form after successful registration
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        nic: "",
        phone: "",
        address: "",
        role: "Tenant",
        gender: "",
        age: "",
        smoking: false,
        alcoholic: false,
        cleanlinessLevel: "Medium",
        noiseTolerance: "Medium",
        sleepingHabit: "Early sleeper",
        socialBehavior: "Balanced",
        preferredRoomType: "Single",
        preferredEnvironment: "Quiet",
        foodAllergies: "",
        medicalConditions: "",
      });
    } catch (err: any) {
      console.error("Registration error:", err);

      if (err.response) {
        // Server responded with error status
        alert(
          `Registration failed: ${
            err.response.data.message || err.response.statusText
          }`
        );
        console.error("Server error:", err.response.data);
      } else if (err.request) {
        // Request was made but no response received
        alert(
          "Registration failed: Cannot connect to server. Please check if backend is running."
        );
        console.error("Network error:", err.request);
      } else {
        // Other errors
        alert("Registration failed: An unexpected error occurred.");
        console.error("Error:", err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Home className="w-10 h-10 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">StayMate</h1>
          </div>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 max-h-[75vh] overflow-y-auto pr-2"
          >
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Tenant">Tenant</option>
                <option value="Owner">Owner</option>
                <option value="MealSupplier">Meal Supplier</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" /> Full Name *
              </label>
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.fullName
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" /> Email *
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.email
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" /> Password *
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" /> Confirm Password *
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.confirmPassword
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* NIC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIC *
              </label>
              <input
                name="nic"
                type="text"
                value={formData.nic}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.nic
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                placeholder="Enter your NIC number"
              />
              {errors.nic && (
                <p className="mt-1 text-sm text-red-600">{errors.nic}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" /> Phone *
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.phone
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" /> Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.address
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                placeholder="Enter your full address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* Tenant-only fields */}
            {formData.role === "Tenant" && (
              <>
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Gender *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === "Male"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2">Male</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={formData.gender === "Female"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2">Female</span>
                    </label>
                  </div>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg ${
                      errors.age
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    placeholder="Enter your age"
                    min="18"
                    max="100"
                  />
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                  )}
                </div>

                {/* Smoking */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Do you smoke?
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="smoking"
                        value="true"
                        checked={formData.smoking === true}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="smoking"
                        value="false"
                        checked={formData.smoking === false}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </div>

                {/* Alcoholic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Do you consume alcohol?
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="alcoholic"
                        value="true"
                        checked={formData.alcoholic === true}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="alcoholic"
                        value="false"
                        checked={formData.alcoholic === false}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </div>

                {/* Cleanliness Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cleanliness Level
                  </label>
                  <select
                    name="cleanlinessLevel"
                    value={formData.cleanlinessLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Noise Tolerance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Noise Tolerance
                  </label>
                  <select
                    name="noiseTolerance"
                    value={formData.noiseTolerance}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Sleeping Habit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleeping Habit
                  </label>
                  <select
                    name="sleepingHabit"
                    value={formData.sleepingHabit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Early sleeper">Early sleeper</option>
                    <option value="Night owl">Night owl</option>
                  </select>
                </div>

                {/* Social Behavior */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Behavior
                  </label>
                  <select
                    name="socialBehavior"
                    value={formData.socialBehavior}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Introvert">Introvert</option>
                    <option value="Balanced">Balanced</option>
                    <option value="Extrovert">Extrovert</option>
                  </select>
                </div>

                {/* Preferred Room Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Room Type
                  </label>
                  <select
                    name="preferredRoomType"
                    value={formData.preferredRoomType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Single">Single</option>
                    <option value="Shared">Shared</option>
                  </select>
                </div>

                {/* Preferred Environment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Environment
                  </label>
                  <select
                    name="preferredEnvironment"
                    value={formData.preferredEnvironment}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Quiet">Quiet</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Lively">Lively</option>
                  </select>
                </div>

                {/* Food Allergies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Allergies (optional)
                  </label>
                  <input
                    type="text"
                    name="foodAllergies"
                    value={formData.foodAllergies}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List any food allergies"
                  />
                </div>

                {/* Medical Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Conditions (optional)
                  </label>
                  <input
                    type="text"
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List any medical conditions"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
