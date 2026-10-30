export function goToPriceMirror(navigate, afterNavigate) {
  const finish = () => {
    if (typeof afterNavigate === "function") afterNavigate();
  };

  if (window.location.pathname === "/") {
    const mirror = document.getElementById("magic-price-mirror");
    if (mirror) {
      mirror.scrollIntoView({ behavior: "smooth", block: "start" });
      finish();
      return;
    }
  }

  localStorage.setItem("jb_focus_price_mirror", "1");
  navigate("/");
  finish();
}
