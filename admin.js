// Legacy compatibility shim.
// The previous admin script contained direct repository credentials.
// That implementation has been retired for security reasons.

document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.getElementById("admin-trigger");
  if (!trigger) return;

  trigger.addEventListener("click", () => {
    window.location.href = "editor.html";
  });
});

