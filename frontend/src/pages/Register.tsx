import { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    nic: "",
    phone: "",
    address: "",
    role: "Tenant",
    gender: "",
    alcoholic: "false",
    foodAllergies: "",
    occupation: "Other",
  });

  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};

    if (!/^[A-Za-z ]+$/.test(formData.fullName)) {
      newErrors.fullName = "Only letters and spaces allowed";
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Password must be 8+ chars with uppercase, number & special character";
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digit number";
    }
    if (formData.nic.length < 9) {
      newErrors.nic = "NIC must be at least 9 characters";
    }
    if (formData.address.length < 5) {
      newErrors.address = "Address too short";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log("Registering user:", formData);
      // call backend API here
    }
  };

  return (
    <div style={{ maxWidth: "450px", margin: "0 auto" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <p style={{ color: "red" }}>{errors.fullName}</p>
        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <p style={{ color: "red" }}>{errors.email}</p>
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <p style={{ color: "red" }}>{errors.password}</p>
        <input
          name="nic"
          placeholder="NIC"
          value={formData.nic}
          onChange={handleChange}
          required
        />
        <p style={{ color: "red" }}>{errors.nic}</p>
        <input
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <p style={{ color: "red" }}>{errors.phone}</p>
        <input
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <p style={{ color: "red" }}>{errors.address}</p>
        <label>
          Role:
          <select name="role" value={formData.role} onChange={handleChange}>
            <option>Tenant</option>
            <option>Landlord</option>
          </select>
        </label>
        <br />
        <label>Gender: </label>
        <input
          type="radio"
          name="gender"
          value="Male"
          onChange={handleChange}
        />
        Male
        <input
          type="radio"
          name="gender"
          value="Female"
          onChange={handleChange}
        />
        Female
        <br />
        <label>Alcoholic: </label>
        <input
          type="radio"
          name="alcoholic"
          value="true"
          onChange={handleChange}
        />
        Yes
        <input
          type="radio"
          name="alcoholic"
          value="false"
          defaultChecked
          onChange={handleChange}
        />
        No
        <br />
        <input
          name="foodAllergies"
          placeholder="Food Allergies (optional)"
          value={formData.foodAllergies}
          onChange={handleChange}
        />
        <br />
        <label>
          Occupation:
          <select
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
          >
            <option>University Student</option>
            <option>Employee</option>
            <option>Other</option>
          </select>
        </label>
        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
