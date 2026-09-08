const loginForm = document.getElementById("login-form");

if (loginForm) {
  (async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) window.location.href = "index.html";
  })();

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const errorBox = document.getElementById("login-error");
    const submitBtn = document.getElementById("login-submit");

    errorBox.textContent = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    submitBtn.disabled = false;
    submitBtn.textContent = "Log In";

    if (error) {
      errorBox.textContent = error.message || "Invalid email or password.";
      return;
    }

    window.location.href = "index.html";
  });
}

async function logoutUser() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

async function requireSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  return session.user;
}