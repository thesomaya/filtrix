import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import "./AuthLayout.css";

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__card">
        <Link to="/" className="auth-layout__logo">
          filtrix
        </Link>

        <h1 className="auth-layout__title">{title}</h1>
        {subtitle && <p className="auth-layout__subtitle">{subtitle}</p>}

        <div className="auth-layout__body">{children}</div>

        {footer && <div className="auth-layout__footer">{footer}</div>}
      </div>
    </div>
  );
}
