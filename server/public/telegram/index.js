document.addEventListener("DOMContentLoaded", start);

async function start() {
  const loaderEl = document.getElementById("loader");
  const botEl = document.getElementById("bot");
  botEl.classList.add("hidden");
  const messageEl = document.getElementById("message");
  messageEl.classList.add("hidden");

  toggleBotStatusButton(false);

  const stopBotEl = document.getElementById("stop-bot");
  stopBotEl.addEventListener("click", async () => {
    await toggleBotStatus({ status: false }).then((res) => {
      if (res.ok) {
        messageEl.classList.add("hidden");
        botEl.classList.remove("hidden");
        toggleBotStatusButton(false);
      } else {
        messageEl.classList.remove("hidden");
        botEl.classList.add("hidden");
        toggleBotStatusButton(true);
      }
    });
  });

  fetch("/api/telegram/health")
    .then((res) => {
      if (res.ok) {
        stopBotEl.classList.remove("hidden");
        messageEl.classList.remove("hidden");
      } else {
        messageEl.classList.add("hidden");
        botEl.classList.remove("hidden");
      }
    })
    .finally(() => {
      loaderEl.classList.add("hidden");
    });

  initBotForm(document.getElementById("bot-form"));
  initMessageForm(document.getElementById("message-form"));
}

function initBotForm(el) {
  el?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const token = formData.get("token");
    const wepApp = formData.get("web-app");

    try {
      const response = await toggleBotStatus({ token, wepApp, status: true });

      if (!response.ok) {
        throw new Error(
          response.statusText || `HTTP error! status: ${response.status}`
        );
      }

      document.getElementById("bot")?.classList.add("hidden");
      document.getElementById("message")?.classList.remove("hidden");
      toggleBotStatusButton(true);

      el.reset();
    } catch (error) {
      console.error("Error:", error.message);
    }

    el.reset();
  });
}

function toggleBotStatusButton(visible = false) {
  const stopBotEl = document.getElementById("stop-bot");
  stopBotEl.classList.toggle("hidden", !visible);
}

async function toggleBotStatus(payload) {
  return fetch("/api/telegram/state", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

function initMessageForm(el) {
  const markupEl = document.getElementById("markup");
  if (markupEl){
    markupEl.innerHTML = ['markdown', 'html'].map((type) => {
      return `<option value="${type}">${type}</option>`;
    }).join('');
  }

  el.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const id = formData.get("id");
    const markup = formData.get("markup");
    const message = formData.get("message");

    try {
      const response = await fetch("/api/telegram/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, message, markup }),
      });

      if (!response.ok) {
        throw new Error(
          response.statusText || `HTTP error! status: ${response.status}`
        );
      }

      await response.json();
      el.reset();
    } catch (error) {
      console.error("Error:", error.message);
    }

    el.reset();
  });
}
