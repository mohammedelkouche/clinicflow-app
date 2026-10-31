import { useState } from "react";

const currentDate = new Date();
const maximumBirthDate = [
  currentDate.getFullYear(),
  String(currentDate.getMonth() + 1).padStart(2, "0"),
  String(currentDate.getDate()).padStart(2, "0"),
].join("-");

function getInitialValues(patient) {
  return {
    fullName: patient?.fullName ?? "",
    cin: patient?.cin ?? "",
    phone: patient?.phone ?? "",
    birthDate: patient?.birthDate?.slice(0, 10) ?? "",
    address: patient?.address ?? "",
  };
}

function PatientForm({
  patient,
  isSubmitting,
  serverError,
  onCancel,
  onSubmit,
}) {
  const [values, setValues] = useState(() => getInitialValues(patient));

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ ...values, address: values.address || null });
  }

  return (
    <form className="patient-form" onSubmit={handleSubmit}>
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

        <label className="form-field">
          <span>CIN</span>
          <input
            name="cin"
            value={values.cin}
            onChange={handleChange}
            maxLength={50}
            placeholder="AB123456"
            required
          />
        </label>

        <label className="form-field">
          <span>Phone</span>
          <input
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            maxLength={50}
            placeholder="+212600000000"
            required
          />
        </label>

        <label className="form-field">
          <span>Birth date</span>
          <input
            name="birthDate"
            type="date"
            value={values.birthDate}
            onChange={handleChange}
            max={maximumBirthDate}
            required
          />
        </label>

        <label className="form-field form-field--wide">
          <span>
            Address <small>Optional</small>
          </span>
          <textarea
            name="address"
            value={values.address}
            onChange={handleChange}
            maxLength={500}
            rows={3}
          />
        </label>
      </div>

      {serverError ? (
        <div className="form-error" role="alert">
          {serverError}
        </div>
      ) : null}

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
          {isSubmitting ? "Saving…" : patient ? "Save changes" : "Add patient"}
        </button>
      </div>
    </form>
  );
}

export default PatientForm;
