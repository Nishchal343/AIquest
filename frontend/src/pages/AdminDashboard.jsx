import { useEffect, useState } from 'react';
import { getAdminOverview, sendCollegeOutreach, updateAdminWorkshop } from '../services/api';
import './admin.css';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function Metric({ label, value, note }) {
  return <article className="admin-metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState(() => window.sessionStorage.getItem('ai-quest-admin-key') ?? '');
  const [overview, setOverview] = useState(null);
  const [workshop, setWorkshop] = useState({ title: 'Build Your First AI Project in 60 Minutes', description: 'The core learning event for this campaign.', starts_at: '', timezone: 'Asia/Calcutta', meeting_url: '' });
  const [outreach, setOutreach] = useState({ college_name: '', coordinator_email: '', distance_km: '', workshop_url: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    setLoading(true); setError('');
    try {
      const result = await getAdminOverview(adminKey);
      if (!result) throw new Error('Backend API is not connected. Start the backend and reload.');
      setOverview(result);
      window.sessionStorage.setItem('ai-quest-admin-key', adminKey);
    } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };

  useEffect(() => { loadDashboard(); }, []);

  const saveWorkshop = async (event) => {
    event.preventDefault(); setError(''); setMessage('');
    try {
      const result = await updateAdminWorkshop(adminKey, { ...workshop, starts_at: workshop.starts_at || null, meeting_url: workshop.meeting_url || null });
      setWorkshop((current) => ({ ...current, ...result, starts_at: result.starts_at ? result.starts_at.slice(0, 16) : '' }));
      setMessage('Workshop details saved. Students will now see the updated link.');
    } catch (requestError) { setError(requestError.message); }
  };

  const sendOutreach = async (event) => {
    event.preventDefault(); setError(''); setMessage('');
    try {
      const result = await sendCollegeOutreach(adminKey, { ...outreach, distance_km: Number(outreach.distance_km), workshop_url: outreach.workshop_url || undefined });
      setMessage(`${result.message} Email sent to ${outreach.coordinator_email}.`);
      setOutreach({ college_name: '', coordinator_email: '', distance_km: '', workshop_url: '' });
      await loadDashboard();
    } catch (requestError) { setError(requestError.message); }
  };

  const summary = overview?.summary ?? {};
  return <main className="admin-app"><header className="admin-header"><div><span className="admin-kicker">AI QUEST · OPERATIONS</span><h1>Admin command center</h1><p>Manage learners, referrals, workshop access, and college outreach from one place.</p></div><div className="admin-access"><label>Prototype admin key<input type="password" value={adminKey} onChange={(event) => setAdminKey(event.target.value)} /></label><button onClick={loadDashboard}>{loading ? 'Loading…' : 'Refresh data'}</button></div></header><section className="admin-content">{error && <div className="admin-alert admin-alert--error">{error}</div>}{message && <div className="admin-alert admin-alert--success">{message}</div>}<div className="admin-metrics"><Metric label="TOTAL LEARNERS" value={summary.total_learners ?? '—'} note="Registered student accounts" /><Metric label="ACTIVE LEARNERS" value={summary.active_learners ?? '—'} note="Learners with recorded activity" /><Metric label="ACTIVITIES" value={summary.total_activities ?? '—'} note="Verified and submitted records" /><Metric label="REFERRALS" value={summary.total_referrals ?? '—'} note={`${summary.verified_referrals ?? 0} verified`} /></div><div className="admin-grid"><section className="admin-card"><div className="admin-card__heading"><div><span className="admin-kicker">WEBINAR CONTROL</span><h2>Publish workshop access</h2></div><span className="admin-status">LIVE SYNC</span></div><p>Saving this form updates the student workshop page at <code>/workshop</code>.</p><form className="admin-form" onSubmit={saveWorkshop}><label>Workshop title<input required value={workshop.title} onChange={(event) => setWorkshop({ ...workshop, title: event.target.value })} /></label><label>Description<textarea required rows="3" value={workshop.description} onChange={(event) => setWorkshop({ ...workshop, description: event.target.value })} /></label><div className="admin-form__row"><label>Start time<input type="datetime-local" value={workshop.starts_at} onChange={(event) => setWorkshop({ ...workshop, starts_at: event.target.value })} /></label><label>Timezone<input value={workshop.timezone ?? ''} onChange={(event) => setWorkshop({ ...workshop, timezone: event.target.value })} placeholder="Asia/Calcutta" /></label></div><label>Webinar / meeting link<input type="url" value={workshop.meeting_url ?? ''} onChange={(event) => setWorkshop({ ...workshop, meeting_url: event.target.value })} placeholder="https://meet.google.com/..." /></label><button className="admin-primary" type="submit">Save and publish workshop</button></form></section><section className="admin-card"><div className="admin-card__heading"><div><span className="admin-kicker">COLLEGE OUTREACH</span><h2>Send workshop invitation</h2></div></div><p>Within 10 km asks about an in-person campus explanation. Beyond 10 km asks the coordinator to forward the link to college groups.</p><form className="admin-form" onSubmit={sendOutreach}><label>College name<input required value={outreach.college_name} onChange={(event) => setOutreach({ ...outreach, college_name: event.target.value })} /></label><label>Coordinator email<input required type="email" value={outreach.coordinator_email} onChange={(event) => setOutreach({ ...outreach, coordinator_email: event.target.value })} /></label><div className="admin-form__row"><label>Distance in km<input required min="0" step="0.1" type="number" value={outreach.distance_km} onChange={(event) => setOutreach({ ...outreach, distance_km: event.target.value })} /></label><label>Link override <small>optional</small><input type="url" value={outreach.workshop_url} onChange={(event) => setOutreach({ ...outreach, workshop_url: event.target.value })} placeholder="Uses saved link" /></label></div><button className="admin-primary" type="submit">Send automated email</button></form></section></div><section className="admin-card admin-table-card"><div className="admin-card__heading"><div><span className="admin-kicker">LEARNER DIRECTORY</span><h2>Students and referrals</h2></div></div><div className="admin-table-wrap"><table><thead><tr><th>Student</th><th>College</th><th>Referral code</th><th>Referrals</th><th>Status</th></tr></thead><tbody>{overview?.students?.length ? overview.students.map((student) => <tr key={student.id}><td><strong>{student.full_name}</strong><small>{student.email}</small></td><td>{student.college}</td><td><code>{student.referral_code ?? '—'}</code></td><td>{student.referrals?.length ? <div className="admin-referrals">{student.referrals.map((referral) => <span key={`${referral.email}-${referral.status}`}><strong>{referral.full_name}</strong><small>{referral.status} · {referral.email}</small></span>)}</div> : <span className="admin-muted">No referrals</span>}</td><td><span className={student.email_verified ? 'admin-pill admin-pill--good' : 'admin-pill'}>{student.email_verified ? 'Verified' : 'Pending email'}</span></td></tr>) : <tr><td colSpan="5" className="admin-empty">No learners registered yet.</td></tr>}</tbody></table></div></section><section className="admin-card admin-table-card"><div className="admin-card__heading"><div><span className="admin-kicker">OUTREACH LOG</span><h2>Recent college emails</h2></div></div><div className="admin-table-wrap"><table><thead><tr><th>College</th><th>Coordinator</th><th>Distance</th><th>Route</th><th>Status</th><th>Sent</th></tr></thead><tbody>{overview?.outreach?.length ? overview.outreach.map((item) => <tr key={item.id}><td>{item.college_name}</td><td>{item.coordinator_email}</td><td>{item.distance_km} km</td><td>{item.option_key === 'campus_visit' ? 'Campus visit' : 'College groups'}</td><td><span className={item.status === 'sent' ? 'admin-pill admin-pill--good' : 'admin-pill admin-pill--bad'}>{item.status}</span></td><td>{formatDate(item.created_at)}</td></tr>) : <tr><td colSpan="6" className="admin-empty">No outreach emails sent yet.</td></tr>}</tbody></table></div></section></section></main>;
}
