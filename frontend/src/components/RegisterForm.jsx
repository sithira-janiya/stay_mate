import React, { useState } from "react";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    nic: "",
    address: "",
    mobile: "",
    allergies: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
      <input name="name" placeholder="Full Name" onChange={handleChange} />
      <input name="age" placeholder="Age" onChange={handleChange} />
      <select name="gender" onChange={handleChange}>
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <input name="nic" placeholder="NIC" onChange={handleChange} />
      <input name="address" placeholder="Address" onChange={handleChange} />
      <input
        name="mobile"
        placeholder="Mobile Number"
        onChange={handleChange}
      />
      <input
        name="allergies"
        placeholder="Food Allergies"
        onChange={handleChange}
      />
      <button type="submit">Register</button>
    </form>
  );
}
