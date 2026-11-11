import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'

import loginBackground from '@/assets/admin/login-background.png'
import logo from '@/assets/logo/esi-logo.png'
import { LangSwitch } from '@/components/ui/LangSwitch'
import { Reveal } from '@/components/ui/Reveal'
import { Seo } from '@/components/ui/Seo'
import { company } from '@/data/company'
import { useT } from '@/i18n'
import { adminAuthErrorKey, safeAdminReturnTo } from '@/lib/adminAuth'
import { useAdminAuth } from '@/lib/useAdminAuth'

const inputClass =
  'min-h-[46px] w-full min-w-0 rounded-sm border border-esi-border bg-white px-3 py-2.5 text-[15px] text-esi-text transition-colors focus:border-esi-blue'

export function AdminLoginPage() {
  const { t } = useT()
  const auth = useAdminAuth()
  const [params] = useSearchParams()
  const returnTo = safeAdminReturnTo(params.get('returnTo'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ReturnType<typeof adminAuthErrorKey> | ''>('')
  const usernameInput = useRef<HTMLInputElement>(null)
  const errorMessage = useRef<HTMLDivElement>(null)
  const focused = useRef(false)

  useEffect(() => {
    if (auth.phase !== 'ready' || focused.current) return
    focused.current = true
    usernameInput.current?.focus()
  }, [auth.phase])

  useEffect(() => {
    if (error) errorMessage.current?.focus()
  }, [error])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || auth.phase !== 'ready') return
    setError('')
    setSubmitting(true)
    try {
      await auth.login(username.trim(), password)
      setPassword('')
    } catch (reason) {
      const message = adminAuthErrorKey(reason)
      setPassword('')
      if (message === 'sessionExpired') await auth.refresh()
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (auth.user) return <Navigate replace to={returnTo} />

  return (
    <div className="flex min-h-svh flex-col bg-esi-light">
      <Seo
        title={`${t('auth.loginTitle')} | ESI`}
        description={t('auth.loginSeoDescription')}
        path="/admin/login"
      />
      <meta name="robots" content="noindex, nofollow, noarchive" />
      <header className="shrink-0 border-b border-esi-border bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-[1328px] items-center justify-between gap-5 px-5 sm:min-h-[88px] sm:px-6">
          <Link to="/" aria-label={t('a11y.home')} className="shrink-0 rounded-sm">
            <img
              src={logo}
              alt={company.shortName}
              width="140"
              height="48"
              className="h-auto w-[90px] sm:w-[104px]"
            />
          </Link>
          <div className="flex min-w-0 items-center gap-6">
            <span className="hidden text-right text-sm font-semibold text-esi-blue sm:block">
              {company.name}
            </span>
            <LangSwitch />
          </div>
        </div>
      </header>

      <main className="relative isolate flex-1 overflow-hidden px-5 pt-[clamp(11rem,46.875vw,22.5rem)] pb-14 lg:grid lg:grid-cols-[minmax(0,1fr)_clamp(20rem,30vw,25rem)] lg:items-center lg:gap-8 lg:bg-white lg:px-8 lg:py-8">
        <img
          src={loginBackground}
          alt=""
          aria-hidden
          width="1671"
          height="941"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-auto w-full lg:static lg:z-auto lg:max-h-[calc(100svh-160px)] lg:object-contain"
        />
        <div className="mx-auto w-full max-w-md lg:max-w-[400px]">
          <Reveal immediate>
            <section
              aria-labelledby="admin-login-title"
              className="rounded-sm border border-esi-border bg-white px-6 pt-7 pb-7 shadow-card sm:px-9 sm:pt-9 lg:px-8 lg:pt-8"
            >
              <h1
                id="admin-login-title"
                className="display-title text-[27px] leading-tight text-esi-blue sm:text-[30px]"
              >
                {t('auth.loginTitle')}
              </h1>
              <span aria-hidden className="mt-[18px] block h-[3px] w-10 bg-esi-blue" />
              <p className="mt-[18px] text-sm leading-relaxed text-esi-muted">
                {t('auth.loginDescription')}
              </p>

              {(auth.expired || params.has('expired')) && !error && (
                <p
                  role="status"
                  className="mt-5 border-l-[3px] border-esi-blue bg-esi-light px-3 py-2 text-sm leading-relaxed text-esi-blue"
                >
                  {t('auth.sessionExpired')}
                </p>
              )}

              {auth.phase === 'error' && (
                <div
                  role="alert"
                  className="mt-5 border-l-[3px] border-esi-blue bg-esi-light px-3 py-3 text-sm leading-relaxed text-esi-blue"
                >
                  <p>{t('auth.unavailable')}</p>
                  <button
                    type="button"
                    onClick={() => void auth.refresh()}
                    className="mt-2 min-h-11 font-semibold underline underline-offset-4"
                  >
                    {t('admin.retry')}
                  </button>
                </div>
              )}

              {error && (
                <div
                  ref={errorMessage}
                  role="alert"
                  tabIndex={-1}
                  className="mt-5 rounded-sm border-l-[3px] border-esi-blue bg-esi-light px-3 py-3 text-sm leading-relaxed text-esi-blue outline-offset-4"
                >
                  {t(`auth.${error}`)}
                </div>
              )}

              <form className="mt-7" onSubmit={submit} aria-busy={submitting}>
                <label
                  htmlFor="admin-username"
                  className="block text-sm font-semibold text-esi-text"
                >
                  {t('auth.username')}
                </label>
                <input
                  ref={usernameInput}
                  id="admin-username"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={64}
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={`${inputClass} mt-2`}
                />
                <label
                  htmlFor="admin-password"
                  className="mt-5 block text-sm font-semibold text-esi-text"
                >
                  {t('auth.password')}
                </label>
                <div className="relative mt-2">
                  <input
                    id="admin-password"
                    name="password"
                    type={visible ? 'text' : 'password'}
                    autoComplete="current-password"
                    maxLength={1024}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    aria-label={t(visible ? 'auth.hidePassword' : 'auth.showPassword')}
                    aria-pressed={visible}
                    onClick={() => setVisible((current) => !current)}
                    className="absolute inset-y-0 right-0 flex min-w-11 items-center justify-center rounded-sm text-esi-muted transition-colors hover:text-esi-blue"
                  >
                    {visible ? <Eye size={18} aria-hidden /> : <EyeOff size={18} aria-hidden />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={submitting || auth.phase !== 'ready'}
                  className="mt-7 inline-flex min-h-[46px] w-full items-center justify-center gap-3 rounded-sm bg-esi-blue px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-esi-secondary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t(
                    submitting
                      ? 'auth.loggingIn'
                      : auth.phase === 'loading'
                        ? 'auth.checkingSession'
                        : 'auth.login',
                  )}
                  {!submitting && auth.phase !== 'loading' && <ArrowRight size={18} aria-hidden />}
                </button>
                <Link
                  to="/"
                  className="mt-4 flex min-h-11 items-center justify-center rounded-sm text-sm font-medium text-esi-blue transition-colors hover:text-esi-navy"
                >
                  {t('auth.backToWebsite')}
                </Link>
              </form>
            </section>
          </Reveal>
        </div>
      </main>
    </div>
  )
}
