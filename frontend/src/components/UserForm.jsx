import { useState } from "react";
import {
  formActions,
  formControl,
  formField,
  formGrid,
  primaryButton,
  quietButton,
} from "../styles/ui.js";

const initialValues = {
  fullName: "",
  email: "",
  password: "",
  role: "staff",
};

function UserForm({ isSubmitting, onCancel, onSubmit }) {
  const [values, setValues] = useState(initialValues);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={formGrid}>
        <label className={`${formField} sm:col-span-2`}>
          <span>Full name</span>
          <input
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            maxLength={200}
            autoFocus
            required
            className={formControl}
          />
        </label>
        <label className={`${formField} sm:col-span-2`}>
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            autoComplete="email"
            required
            className={formControl}
          />
        </label>
        <label className={formField}>
          <span>Temporary password</span>
          <input
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            minLength={8}
            maxLength={100}
            autoComplete="new-password"
            required
            className={formControl}
          />
        </label>
        <label className={formField}>
          <span>Role</span>
          <select className={formControl} name="role" value={values.role} onChange={handleChange}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>
      <div className={formActions}>
        <button
          className={quietButton}
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className={primaryButton}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating…" : "Create user"}
        </button>
      </div>
    </form>
  );
}

export default UserForm;
