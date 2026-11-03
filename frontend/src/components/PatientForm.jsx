import { useState } from "react";
import {
  formActions,
  formControl,
  formField,
  formGrid,
  primaryButton,
  quietButton,
} from "../styles/ui.js";

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

function PatientForm({ patient, isSubmitting, onCancel, onSubmit }) {
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

        <label className={formField}>
          <span>CIN</span>
          <input
            name="cin"
            value={values.cin}
            onChange={handleChange}
            maxLength={50}
            placeholder="AB123456"
            required
            className={formControl}
          />
        </label>

        <label className={formField}>
          <span>Phone</span>
          <input
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            maxLength={50}
            placeholder="+212600000000"
            required
            className={formControl}
          />
        </label>

        <label className={formField}>
          <span>Birth date</span>
          <input
            name="birthDate"
            type="date"
            value={values.birthDate}
            onChange={handleChange}
            max={maximumBirthDate}
            required
            className={formControl}
          />
        </label>

        <label className={`${formField} sm:col-span-2`}>
          <span>
            Address <small className="ml-1 font-normal text-muted">Optional</small>
          </span>
          <textarea
            name="address"
            value={values.address}
            onChange={handleChange}
            maxLength={500}
            rows={3}
            className={`${formControl} resize-y`}
          />
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
          {isSubmitting ? "Saving…" : patient ? "Save changes" : "Add patient"}
        </button>
      </div>
    </form>
  );
}

export default PatientForm;
