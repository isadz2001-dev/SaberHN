import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { user } = useAuth();
  // Native app behavior: if logged in go to dashboard, otherwise go to login
  return <Navigate to={user ? "/dashboard" : "/login"} />;
}
