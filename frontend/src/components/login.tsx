import { useState } from "react";
import XIcon from "../assets/x_logo.svg?react";
import { type AxiosResponse } from "axios";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./login.css";

export function Login() {
  type LoginData = {
    username: string;
    password: string;
  };

  type TokenResponse = {
    access: string;
    refresh?: string;
  };

  type UserData = {
    id: number;
    name: string;
    email: string;
    username: string;
    profile_image: string;
    profile_banner: string;
    bio: string;
    followers_count: number;
    following_count: number;
    birthday: string;
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inError, setInError] = useState("untouched");
  const [seconds, setSeconds] = useState(3);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const sleep = (): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  async function redirecting(): Promise<void> {
    let current = seconds;

    while (current !== 0) {
      await sleep();
      current--;
      setSeconds(current);
    }

    navigate("/home");
  }

  const postLogin = async (
    userData: LoginData,
  ): Promise<AxiosResponse<TokenResponse>> => {
    return await api.post<TokenResponse>("/token/", userData, {
      withCredentials: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user = {
      username,
      password,
    };

    try {
      setInError("untouched");

      const response = await postLogin(user);

      const userInfos = await api.get<UserData>("/users/me/", {
        headers: {
          Authorization: `Bearer ${response.data.access}`,
        },
      });

      login(
        {
          id: userInfos.data.id,
          username: userInfos.data.username,
        },
        response.data.access,
      );

      setInError("ok");
      redirecting();
    } catch (error) {
      console.log(error);
      setInError("erro");
    }
  };

return (
  <main className="login-page">
    {/* Fundo decorativo */}
    <div className="login-bg">
      <div className="login-glow login-glow-blue" />
      <div className="login-glow login-glow-purple" />
    </div>

    {/* Card */}
    <section className="login-card">

      {/* Logo */}
      <div className="login-logo">
        <XIcon />
      </div>

      {/* Título */}
      <div className="login-title">
        <h1>Welcome back</h1>
        <p>Sign in to continue to your account</p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="login-form">

        {/* Username */}
        <div className="login-field">
          <label htmlFor="username">
            Username
          </label>

          <div className="login-input-container">
            <span className="login-input-icon">@</span>

            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              type="text"
              name="username"
              placeholder="Enter your username"
            />
          </div>
        </div>

        {/* Password */}
        <div className="login-field">
          <label htmlFor="password">
            Password
          </label>

          <div className="login-input-container">
            <span className="login-input-icon">●</span>

            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>
        </div>

        {/* Erro */}
        {inError === "erro" && (
          <div className="login-alert login-alert-error">
            <span>!</span>
            <p>Incorrect username or password.</p>
          </div>
        )}

        {/* Sucesso */}
        {inError === "ok" && (
          <div className="login-alert login-alert-success">
            <span>✓</span>
            <p>
              Logged in successfully. Redirecting in{" "}
              {seconds}...
            </p>
          </div>
        )}

        {/* Botão */}
        <button
          type="submit"
          className="login-submit"
        >
          Sign in
        </button>
      </form>

      {/* Separador */}
      <div className="login-separator">
        <span>OR</span>
      </div>

      {/* Cadastro */}
      <div className="login-signup">
        <span>Don't have an account?</span>

        <button
          type="button"
          onClick={() => navigate("/signup")}
        >
          Create an account
        </button>
      </div>
    </section>

    {/* Rodapé */}
    <div className="login-footer">
      <span>© 2026 X Clone</span>
      <span>•</span>
      <span>Built with React</span>
    </div>
  </main>
);
}