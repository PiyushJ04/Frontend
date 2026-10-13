import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.jsx';
import RolePicker from '../workspace/RolePicker.jsx';
import Workspace from '../workspace/Workspace.jsx';
import { buildRoles, readExams, roleKey } from '../workspace/store.js';

export default function DashboardPage() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const [tick, setTick] = useState(0);
  const roles = useMemo(() => buildRoles(user), [user, tick]);

  const fromExam = (e) => {
    const match = roles.find((r) => r.key === e.role_key);
    return match || { key: e.role_key || `exam|${e.id}`, subject: e.subject, academic_year: '', department: user?.department || '' };
  };
  const initialExam = params.examId ? readExams().find((e) => e.id === params.examId) : null;
  const [session, setSession] = useState(() => (params.examId ? { role: initialExam ? fromExam(initialExam) : { key: `exam|${params.examId}`, subject: 'Your class', academic_year: '', department: '' }, examId: params.examId } : null));

  const out = () => { logout(); navigate('/'); };
  const back = () => { setSession(null); navigate('/dashboard'); };

  return (
    <LayoutGroup>
      <AnimatePresence mode="popLayout">
        {!session ? (
          <motion.div key="roles" exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <RolePicker
              user={user}
              roles={roles}
              onRolesChanged={() => setTick((t) => t + 1)}
              onPick={(r) => {
                const existing = readExams().find((e) => e.role_key === r.key);
                setSession({ role: r, examId: existing?.id || null });
              }}
              onResume={(e) => { setSession({ role: fromExam(e), examId: e.id }); navigate(`/dashboard/exams/${e.id}`, { replace: true }); }}
              onLogout={out}
            />
          </motion.div>
        ) : (
          <motion.div key={`ws-${session.role.key}`} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: 0.15 }}>
            <Workspace
              token={token}
              role={session.role}
              examId={session.examId}
              onCreated={(id) => { setSession((s) => ({ ...s, examId: id })); navigate(`/dashboard/exams/${id}`, { replace: true }); }}
              onBack={back}
              onLogout={out}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
