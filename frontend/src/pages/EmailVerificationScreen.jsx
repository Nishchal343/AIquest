import { useState } from 'react';
import { resendVerification, verifyEmail } from '../services/api';
import { writeStudentState } from '../services/storage';
import { PrimaryButton } from './student-ui.jsx';

export default function EmailVerificationScreen({ navigate }) {
  const email = new URLSearchParams(window.location.search).get('email') ?? '';
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const submit = async (event) => { event.preventDefault(); setError(''); try { await verifyEmail(code); writeStudentState({ emailVerification: 'verified' }); setVerified(true); setMessage('Email verified successfully.'); } catch (verificationError) { setError(verificationError.message); } };
  const resend = async () => { setError(''); try { const result = await resendVerification(email); setMessage(result.status); } catch (resendError) { setError(resendError.message); } };
  return <main className="form-screen"><section className="form-card"><span className="eyebrow">ACCOUNT SECURITY</span><h1>Verify your <span>email.</span></h1><p>We sent a six-digit verification code to <strong>{email || 'your email address'}</strong>. Enter it below to activate your AI Quest account.</p>{verified ? <><div className="form-success">{message}</div><button className="student-button" onClick={() => navigate('/dashboard')}>Continue to AI Quest</button></> : <form onSubmit={submit}><label>6-digit verification code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} placeholder="000000" /></label>{error && <div className="form-error">{error}</div>}{message && <div className="form-success">{message}</div>}<button className="student-button" type="submit">Verify email</button><button className="link-button" type="button" onClick={resend}>Resend code</button></form>}</section></main>;
}
