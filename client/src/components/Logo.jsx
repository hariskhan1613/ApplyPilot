import logoImage from '../assets/ApplyPilotLogo.png'
import { Link } from 'react-router-dom'

export function LogoMark({ size = 28 }) {
  return <img src={logoImage} width={size} height={size} alt="" aria-hidden="true" className="logo-image" />
}

export function Logo({ to = "/dashboard" }) {
  return (
    <Link className="brand" to={to}>
      <LogoMark />
      <span>ApplyPilot</span>
    </Link>
  );
}
