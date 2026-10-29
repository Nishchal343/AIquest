export function PrimaryButton({ children, onClick, secondary = false, type = 'button' }) {
  return <button type={type} className={`student-button${secondary ? ' student-button--secondary' : ''}`} onClick={onClick}>{children}</button>;
}
