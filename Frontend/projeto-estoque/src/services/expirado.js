export function expirado() {
  const token = localStorage.getItem("accessToken");
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() > payload.exp * 1000;
  } catch (e) {
    return true;
  }
}

export function limparSessao() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("username");
}
