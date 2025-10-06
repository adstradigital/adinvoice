"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jwtDecode from "jwt-decode";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/signin");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/signin");
      } else {
        setIsAuthorized(true);
      }
    } catch (err) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.push("/signin");
    }
  }, [router]);

  if (!isAuthorized) {
    return <p>Loading...</p>; // Optional loading while checking token
  }

  return <>{children}</>;
}
