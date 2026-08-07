import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthContext";

type Mode = "login" | "signup";

export function AuthPage() {
  const { login, signup, seedDemo } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const heading = mode === "login" ? "Login" : "Create account";
  const submitLabel = mode === "login" ? "Login" : "Sign up";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const action = mode === "login" ? login : signup;
    const result = await action(username, password);

    if (!result.ok) {
      setError(result.message ?? "Authentication failed.");
    }

    setIsSubmitting(false);
  };

  const onSeedDemo = async () => {
    setError("");
    setMessage("");
    const result = await seedDemo();

    if (result.ok) {
      setMessage(result.message ?? "Demo account seeded.");
      return;
    }

    setError(result.message ?? "Unable to seed demo account.");
  };

  return (
    <main className="auth-layout" data-testid="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Todo Trainer</p>
        <h1>{heading}</h1>
        <p className="subtitle">
          Log in before accessing your personal dashboard.
        </p>

        <div
          className="mode-switch"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            type="button"
            role="tab"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
            data-testid="mode-login"
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
            data-testid="mode-signup"
          >
            Sign up
          </button>
        </div>

        <form onSubmit={onSubmit} className="auth-form" data-testid="auth-form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            placeholder="yourname"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            data-testid="input-username"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            placeholder="minimum 4 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            data-testid="input-password"
          />

          {error ? (
            <p className="error-message" data-testid="auth-error">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="success-message" data-testid="auth-message">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            data-testid="submit-auth"
          >
            {isSubmitting ? "Please wait..." : submitLabel}
          </button>
        </form>

        <button
          type="button"
          className="secondary"
          onClick={onSeedDemo}
          data-testid="seed-demo"
        >
          Seed demo user (demo / demo1234)
        </button>
      </section>
    </main>
  );
}
