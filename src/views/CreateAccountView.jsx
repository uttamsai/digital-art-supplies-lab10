import { useState } from 'react'
import { Link } from 'react-router-dom'

const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL',
  'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT',
  'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
])

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ZIP_RE = /^\d{5}(-\d{4})?$/
const PHONE_RE = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
const apiUrl = import.meta.env.VITE_CUSTOMERS_API_URL || 'http://localhost:8080/api/customers'

const emptyForm = {
  login: '',
  password: '',
  confirmPassword: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
}

// Show the signup form and save valid customer details through the API.
// The Create Account form. login, password, and email are required. The
// address fields (street/city/state/zip) are optional as a group, but if any
// one of them is filled in, all of them must be, and each field's format is
// checked. Phone is optional but must be a valid US phone format if given.
// The existing form layout is preserved; valid submissions are saved by the API.
function CreateAccountView() {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Check the form fields before sending a signup request.
  function validate(values) {
    const nextErrors = {}

    if (!values.login.trim()) {
      nextErrors.login = 'Login is required.'
    } else if (values.login.trim().length < 3) {
      nextErrors.login = 'Login must be at least 3 characters.'
    }

    if (!values.password) {
      nextErrors.password = 'Password is required.'
    } else if (values.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }
    if (values.password && values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (!values.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!EMAIL_RE.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    // Optional address group: street, city, state, zip. If any one of them
    // has a value, all four become required and each is format-checked.
    const addressFields = ['street', 'city', 'state', 'zip']
    const addressStarted = addressFields.some((f) => values[f].trim() !== '')
    if (addressStarted) {
      if (!values.street.trim()) nextErrors.street = 'Street is required once any address field is entered.'
      if (!values.city.trim()) nextErrors.city = 'City is required once any address field is entered.'

      if (!values.state.trim()) {
        nextErrors.state = 'State is required once any address field is entered.'
      } else if (!US_STATES.has(values.state.trim().toUpperCase())) {
        nextErrors.state = 'Enter a valid 2-letter US state code (e.g. CA).'
      }

      if (!values.zip.trim()) {
        nextErrors.zip = 'ZIP code is required once any address field is entered.'
      } else if (!ZIP_RE.test(values.zip.trim())) {
        nextErrors.zip = 'Enter a valid ZIP code (e.g. 94538 or 94538-1234).'
      }
    }

    // only validated if provided.
    if (values.phone.trim() && !PHONE_RE.test(values.phone.trim())) {
      nextErrors.phone = 'Enter a valid phone number (e.g. 555-123-4567).'
    }

    return nextErrors
  }

  // Send a valid signup to the server and show the result.
  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    setSubmitted(false)
    setServerError('')
    if (Object.keys(nextErrors).length > 0) return
    setSubmitting(true)
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: form.login, email: form.email, password: form.password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not create account.')
      setSubmitted(true)
      setForm(emptyForm)
    } catch (error) {
      setServerError(error.message || 'Could not create account.')
    } finally {
      setSubmitting(false)
    }
  }

  // Render a labeled input with its validation message.
  function field(name, label, type = 'text', required = false) {
    return (
      <div className="mb-3">
        <label htmlFor={name} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <input
          id={name}
          name={name}
          type={type}
          className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
          value={form[name]}
          onChange={(e) => update(name, e.target.value)}
        />
        {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <h1 className="h3 mb-1">Create Account</h1>
          <p className="text-muted mb-4">
            Fields marked <span className="text-danger">*</span> are required. Address
            fields are optional, but if you fill in one you must complete all of them.
          </p>

          {submitted && (
            <div className="alert alert-success" role="status">
              Account saved. Your login now appears in the Customers list.
            </div>
          )}
          {serverError && <div className="alert alert-danger" role="alert">{serverError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <h2 className="h6 text-uppercase text-muted">Login Info</h2>
            {field('login', 'Login', 'text', true)}
            {field('password', 'Password', 'password', true)}
            {field('confirmPassword', 'Confirm Password', 'password', true)}
            {field('email', 'Email', 'email', true)}

            <h2 className="h6 text-uppercase text-muted mt-4">
              Address <span className="text-muted normal-case">(optional)</span>
            </h2>
            {field('street', 'Street')}
            <div className="row">
              <div className="col-sm-6">{field('city', 'City')}</div>
              <div className="col-sm-3">{field('state', 'State')}</div>
              <div className="col-sm-3">{field('zip', 'ZIP')}</div>
            </div>

            <h2 className="h6 text-uppercase text-muted mt-4">
              Phone <span className="text-muted normal-case">(optional)</span>
            </h2>
            {field('phone', 'Phone', 'tel')}

            <button type="submit" className="btn btn-primary w-100 mt-3" disabled={submitting}>
              Create Account
            </button>
          </form>

          <p className="text-center mt-3">
            <Link to="/account">Back to Account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default CreateAccountView
