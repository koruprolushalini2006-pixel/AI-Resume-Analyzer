import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">
        <Link to="/">AI Resume Analyzer</Link>
      </div>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <a href="#features">Features</a>
        </li>

        <li>
          <a href="#about">About</a>
        </li>
      </ul>

      {/* Login Button */}
      <Link to="/login">
        <button className="login-btn">Login</button>
      </Link>
    </nav>
  );
}

export default Navbar;