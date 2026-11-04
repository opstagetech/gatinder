/**
 * Login sem e-mail: o Supabase exige um e-mail, mas ele não precisa existir.
 * Quem digita só "matheus" entra como "matheus@gatinder.local".
 * Para criar um login assim: Supabase → Authentication → Users → Add user,
 * e-mail "matheus@gatinder.local" + senha, com "Auto Confirm User" marcado.
 */
export const LOGIN_DOMAIN = 'gatinder.local';

export function loginToEmail(input: string): string {
  const v = input.trim().toLowerCase();
  return v.includes('@') ? v : `${v}@${LOGIN_DOMAIN}`;
}

export function emailToLogin(email: string | undefined): string {
  if (!email) return '';
  return email.endsWith(`@${LOGIN_DOMAIN}`) ? email.slice(0, -LOGIN_DOMAIN.length - 1) : email;
}
