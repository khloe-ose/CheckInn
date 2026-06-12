const logo = '/checkinn-logo.png'

export default function BrandLogo({ variant = 'compact', className = '' }) {
  if (variant === 'full') {
    return <img src={logo} alt="CheckInn" className={className || 'h-auto w-64'} />
  }

  if (variant === 'mark') {
    return <img src={logo} alt="CheckInn" className={className || 'h-14 w-auto'} />
  }

  return <img src={logo} alt="CheckInn" className={className || 'h-16 w-auto'} />
}
