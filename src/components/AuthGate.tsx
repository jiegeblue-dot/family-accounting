import { useState, type ReactNode } from 'react';

const AUTH_KEY = 'family-accounting-secret';
const SESSION_KEY = 'family-accounting-session';

function getStoredSecret(): string {
  return localStorage.getItem(AUTH_KEY) || '';
}

function setStoredSecret(code: string) {
  localStorage.setItem(AUTH_KEY, code);
}

function getSession(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

function setSession() {
  sessionStorage.setItem(SESSION_KEY, '1');
}

interface Props {
  children: ReactNode;
  onSecretSet: () => void;
}

export default function AuthGate({ children, onSecretSet }: Props) {
  const [secret] = useState(getStoredSecret);
  const [authed, setAuthed] = useState(getSession);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  // Already authenticated
  if (authed) return <>{children}</>;

  // First time setup: no secret yet
  if (!secret) {
    const handleSetup = () => {
      const code = input.trim();
      if (code.length < 4) {
        setError('邀请码至少 4 位');
        return;
      }
      setStoredSecret(code);
      setSession();
      setAuthed(true);
      onSecretSet();
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">家庭记账</h1>
          <p className="text-sm text-gray-500 mb-6">首次使用，请设置一个邀请码<br/>后续家人通过此码访问</p>
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            placeholder="设置邀请码（至少4位）"
            className="w-full px-4 py-3 text-sm border-2 border-gray-100 rounded-xl outline-none focus:border-indigo-300 text-center tracking-widest"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSetup()}
          />
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          <button
            onClick={handleSetup}
            className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-all"
          >
            确认设置
          </button>
        </div>
      </div>
    );
  }

  // Has secret: show login
  const handleLogin = () => {
    if (input.trim() === secret) {
      setSession();
      setAuthed(true);
      setError('');
    } else {
      setError('邀请码错误，请重试');
      setInput('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">家庭记账</h1>
        <p className="text-sm text-gray-500 mb-6">请输入邀请码</p>
        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(''); }}
          placeholder="邀请码"
          className="w-full px-4 py-3 text-sm border-2 border-gray-100 rounded-xl outline-none focus:border-indigo-300 text-center tracking-widest"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-all"
        >
          进入
        </button>
      </div>
    </div>
  );
}

export { getStoredSecret, setStoredSecret };
