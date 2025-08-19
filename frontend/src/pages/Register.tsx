import React, { useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  AlertCircle,
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

  const validate = () => {
    const newErrors: any = {};
    if (!/^[A-Za-z ]+$/.test(formData.fullName))
      newErrors.fullName = "Only letters and spaces allowed";
    if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        formData.password
      )
    )
      newErrors.password =
        "Password must be 8+ chars with uppercase, number & special character";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be 10 digit number";
    if (formData.nic.length < 9)
      newErrors.nic = "NIC must be at least 9 characters";
    if (formData.address.length < 5) newErrors.address = "Address too short";

    if (formData.role === "Tenant") {
      if (
        formData.age === "" ||
        Number(formData.age) < 18 ||
        Number(formData.age) > 100
      )
        newErrors.age = "Age must be between 18 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleChange = (
   e: React.ChangeEvent<
     HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
   >
 ) => {
   const target = e.target as HTMLInputElement; // cast to input
   const { name, value, type } = target;
   let val: any = value;

   if (type === "radio" && (name === "smoking" || name === "alcoholic")) {
     val = target.value === "true";
   }

   setFormData({ ...formData, [name]: val });
 };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/register",
          formData
        );
        alert("Registration successful!");
        console.log(res.data);
      } catch (err: any) {
        alert("Registration failed. Please try again.");
        console.error(err.response?.data || err.message);
      }
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
                className="w-full px-4 py-3 border rounded-lg border-gray-300"
              >
                <option value="Tenant">Tenant</option>
                <option value="Owner">Owner</option>
                <option value="MealSupplier">Meal Supplier</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" /> Full Name
              </label>
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.fullName
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" /> Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg border-gray-300"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" /> Password
              </label>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg border-gray-300"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" /> Confirm Password
              </label>
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg border-gray-300"
                required
              />
            </div>

            {/* NIC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIC
              </label>
              <input
                name="nic"
                type="text"
                value={formData.nic}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg border-gray-300"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" /> Phone
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg border-gray-300"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" /> Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border rounded-lg border-gray-300"
                required
              />
            </div>

            {/* Tenant-only fields */}
            {formData.role === "Tenant" && (
              <>
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Gender
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span className="ml-2">Male</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span className="ml-2">Female</span>
                    </label>
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300"
                  />
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
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="smoking"
                        value="false"
                        defaultChecked
                        onChange={handleChange}
                        className="w-4 h-4"
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
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="alcoholic"
                        value="false"
                        defaultChecked
                        onChange={handleChange}
                        className="w-4 h-4"
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
                    className="w-full px-4 py-3 border rounded-lg border-gray-300"
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
                    className="w-full px-4 py-3 border rounded-lg border-gray-300"
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
                    className="w-full px-4 py-3 border rounded-lg border-gray-300"
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
                    className="w-full px-4 py-3 border rounded-lg border-gray-300"
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
                    className="w-full px-4 py-3 border rounded-lg border-gray-300"
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
                    className="w-full px-4 py-3 border rounded-lg border-gray-300"
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
                    className="w-full px-4 py-3 border rounded-lg border-gray-300"
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
                    className="w-full px-4 py-3 border rounded-lg border-gray-300"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
