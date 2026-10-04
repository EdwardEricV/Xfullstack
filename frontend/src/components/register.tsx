import { useState } from "react";
import XIcon from "../assets/x_logo.svg?react";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./register.css";

export function Register() {
  type RegisterData = {
    name: string;
    email: string;
    username: string;
    password: string;
    birthday: string;
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");

  const [usernameExist, setUsernameExist] = useState(false);

  const [nameValid, setNameValid] = useState("untouched");
  const [usernameValid, setUsernameValid] = useState("untouched");
  const [emailValid, setEmailValid] = useState("untouched");
  const [pass2Valid, setPass2Valid] = useState("untouched");
  const [passValid, setPassValid] = useState("untouched");

  const [passwordtest1, setPasswordtest1] = useState(false);
  const [passwordtest2, setPasswordtest2] = useState(false);
  const [passwordtest3, setPasswordtest3] = useState(false);
  const [passwordtest4, setPasswordtest4] = useState(false);
  const [passwordtest5, setPasswordtest5] = useState(false);

  const [passwordVerified, setPasswordVerified] = useState(false);

  const [inError, setInError] = useState("untouched");
  const [seconds, setSeconds] = useState(3);

  const goToLogin = () => {
    navigate("/signin");
  };

  const postRegister = async (userData: RegisterData): Promise<number> => {
    const response = await api.post("/users/", userData);
    return response.status;
  };

  const validName = (value: string) => {
    if (value.length >= 3 && value.length <= 25) {
      setNameValid("valid");
    } else {
      setNameValid("invalid");
    }
  };

  const validUsername = (value: string) => {
    if (value.length >= 4 && value.length <= 16) {
      setUsernameValid("valid");
    } else {
      setUsernameValid("invalid");
    }
  };

  const validEmail = (value: string) => {
    if (/@/.test(value)) {
      setEmailValid("valid");
    } else {
      setEmailValid("invalid");
    }
  };

  const hasNumber = (value: string) => /[0-9]/.test(value);
  const hasLower = (value: string) => /[a-z]/.test(value);
  const hasUpper = (value: string) => /[A-Z]/.test(value);
  const hasSpecial = (value: string) => /[!@#$%&*]/.test(value);

  const verifyQuantity = (value: string) => {
    return value.length >= 8 && value.length <= 20;
  };

  const verifyPassword = (value: string) => {
    const number = hasNumber(value);
    const lower = hasLower(value);
    const upper = hasUpper(value);
    const special = hasSpecial(value);
    const quantity = verifyQuantity(value);

    setPasswordtest1(number);
    setPasswordtest2(lower);
    setPasswordtest3(upper);
    setPasswordtest4(special);
    setPasswordtest5(quantity);

    if (number && lower && upper && special && quantity) {
      setPasswordVerified(true);
      setPassValid("valid");
    } else {
      setPasswordVerified(false);
      setPassValid("invalid");
    }
  };

  const passwordMatch = pass1 === pass2;

  const validatePasswordMatch = (password1: string, password2: string) => {
    if (password1 === password2) {
      setPass2Valid("valid");
    } else {
      setPass2Valid("invalid");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !passwordMatch ||
      !passwordVerified ||
      nameValid !== "valid" ||
      usernameValid !== "valid" ||
      emailValid !== "valid" ||
      !day ||
      !month ||
      !year
    ) {
      setInError("erro");
      return;
    }

    const birthday = `${year}-${String(months.indexOf(month) + 1).padStart(
      2,
      "0",
    )}-${String(day).padStart(2, "0")}`;

    const userData = {
      name,
      email,
      username,
      password: pass1,
      birthday,
    };

    try {
      await postRegister(userData);

      setInError("ok");

      let current = 3;

      while (current !== 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        current--;
        setSeconds(current);
      }

      navigate("/signin");
    } catch (error) {
      const err = error as AxiosError<{ username?: string[] }>;

      if (err.response?.data?.username) {
        setUsernameExist(true);
      } else {
        setInError("erro");
      }
    }
  };

  return (
  <main className="register-page">

    {/* =========================
        BACKGROUND
    ========================= */}

    <div className="register-bg">
      <div className="register-glow register-glow-blue" />
      <div className="register-glow register-glow-purple" />
    </div>


    {/* =========================
        CARD
    ========================= */}

    <section className="register-card">

      {/* Logo */}

      <div className="register-logo">
        <XIcon />
      </div>


      {/* Cabeçalho */}

      <div className="register-header">

        <h1>Create your account</h1>

        <p>
          Join X and connect with people around the world.
        </p>

      </div>


      {/* =========================
          FORM
      ========================= */}

      <form
        onSubmit={handleSubmit}
        className="register-form"
      >

        {/* =========================
            NAME
        ========================= */}

        <div className="register-field">

          <label htmlFor="name">
            Full name
          </label>

          <input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              validName(e.target.value);
            }}
            required
            type="text"
            name="name"
            placeholder="Enter your full name"
          />

          {nameValid === "invalid" && (
            <p className="field-error">
              Name must contain between 3 and 25 characters.
            </p>
          )}

        </div>


        {/* =========================
            EMAIL
        ========================= */}

        <div className="register-field">

          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validEmail(e.target.value);
            }}
            required
            type="email"
            name="email"
            placeholder="Enter your email"
          />

          {emailValid === "invalid" && (
            <p className="field-error">
              Please enter a valid email address.
            </p>
          )}

        </div>


        {/* =========================
            USERNAME
        ========================= */}

        <div className="register-field">

          <label htmlFor="username">
            Username
          </label>

          <input
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              validUsername(e.target.value);
              setUsernameExist(false);
            }}
            required
            type="text"
            name="username"
            autoComplete="username"
            placeholder="Choose a username"
          />

          {usernameExist && (
            <p className="field-error">
              This username is already taken.
            </p>
          )}

          {usernameValid === "invalid" && (
            <p className="field-error">
              Username must contain between 4 and 16 characters.
            </p>
          )}

        </div>


        {/* =========================
            BIRTHDAY
        ========================= */}

        <div className="register-field">

          <label>
            Date of birth
          </label>

          <p className="field-description">
            This will not be shown publicly.
          </p>


          <div className="birthday-grid">

            {/* Day */}

            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              required
            >
              <option value="" disabled>
                Day
              </option>

              {Array.from(
                { length: 31 },
                (_, i) => i + 1
              ).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>


            {/* Month */}

            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
            >
              <option value="" disabled>
                Month
              </option>

              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>


            {/* Year */}

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            >
              <option value="" disabled>
                Year
              </option>

              {Array.from(
                { length: 2026 - 1900 + 1 },
                (_, i) => 2026 - i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

          </div>

        </div>


        {/* =========================
            PASSWORD
        ========================= */}

        <div className="register-field">

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            value={pass1}
            onChange={(e) => {
              setPass1(e.target.value);
              verifyPassword(e.target.value);
              validatePasswordMatch(
                e.target.value,
                pass2
              );
            }}
            required
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a password"
          />


          {/* Password validation */}

          {passValid === "invalid" && (
            <div className="password-rules">

              <p className={passwordtest5 ? "rule-valid" : "rule-invalid"}>
                <span>
                  {passwordtest5 ? "✓" : "○"}
                </span>
                8–20 characters
              </p>

              <p className={passwordtest1 ? "rule-valid" : "rule-invalid"}>
                <span>
                  {passwordtest1 ? "✓" : "○"}
                </span>
                At least one number
              </p>

              <p className={passwordtest2 ? "rule-valid" : "rule-invalid"}>
                <span>
                  {passwordtest2 ? "✓" : "○"}
                </span>
                At least one lowercase letter
              </p>

              <p className={passwordtest3 ? "rule-valid" : "rule-invalid"}>
                <span>
                  {passwordtest3 ? "✓" : "○"}
                </span>
                At least one uppercase letter
              </p>

              <p className={passwordtest4 ? "rule-valid" : "rule-invalid"}>
                <span>
                  {passwordtest4 ? "✓" : "○"}
                </span>
                At least one special character
              </p>

            </div>
          )}

        </div>


        {/* =========================
            CONFIRM PASSWORD
        ========================= */}

        <div className="register-field">

          <label htmlFor="confirm_password">
            Confirm password
          </label>

          <input
            id="confirm_password"
            value={pass2}
            onChange={(e) => {
              setPass2(e.target.value);

              validatePasswordMatch(
                pass1,
                e.target.value
              );
            }}
            required
            type="password"
            name="confirm_password"
            autoComplete="new-password"
            placeholder="Confirm your password"
          />

          {pass2Valid === "invalid" && (
            <p className="field-error">
              Passwords do not match.
            </p>
          )}

        </div>


        {/* =========================
            GENERAL ERROR
        ========================= */}

        {inError === "erro" && (
          <div className="register-alert register-alert-error">

            <span>!</span>

            <p>
              Please check the information entered
              and try again.
            </p>

          </div>
        )}


        {/* =========================
            SUCCESS
        ========================= */}

        {inError === "ok" && (
          <div className="register-alert register-alert-success">

            <span>✓</span>

            <p>
              Account created successfully.
              Redirecting in {seconds}...
            </p>

          </div>
        )}


        {/* =========================
            SUBMIT
        ========================= */}

        <button
          type="submit"
          className="register-submit"
        >
          Create account
        </button>

      </form>


      {/* =========================
          LOGIN
      ========================= */}

      <div className="register-login">

        <span>
          Already have an account?
        </span>

        <button
          type="button"
          onClick={goToLogin}
        >
          Log in
        </button>

      </div>

    </section>


    {/* =========================
        FOOTER
    ========================= */}

    <footer className="register-footer">

      <span>© 2026 X Clone</span>

      <span>•</span>

      <span>Built with React</span>

    </footer>

  </main>
);
}