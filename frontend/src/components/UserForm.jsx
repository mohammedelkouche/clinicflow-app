import { useState } from "react";

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
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="form-field form-field--wide">
          <span>Full name</span>
          <input
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            maxLength={200}
            autoFocus
            required
          />
        </label>
        <label className="form-field form-field--wide">
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </label>
        <label className="form-field">
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
          />
        </label>
        <label className="form-field">
          <span>Role</span>
          <select name="role" value={values.role} onChange={handleChange}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>
      <div className="form-actions">
        <button
          className="button button--quiet"
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          className="button button--primary"
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
