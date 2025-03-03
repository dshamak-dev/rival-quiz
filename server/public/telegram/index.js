document.addEventListener("DOMContentLoaded", start);

async function start() {
  const loaderEl = document.getElementById("loader");
  const messageEl = document.getElementById("message");
  messageEl.classList.add("hidden");

  toggleBotStatusButton(false);

  const bots = await fetch("/api/telegram/health")
    .then((res) => {
      if (res.ok) {
        messageEl.classList.remove("hidden");

        return res.json();
      } else {
        messageEl.classList.add("hidden");
      }
    })
    .finally(() => {
      loaderEl.classList.add("hidden");
    });

  initMessageForm(document.getElementById("message-form"), bots);
}

function setBotData(el) {
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
  stopBotEl?.classList?.toggle("hidden", !visible);
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

function setChatIdSelect(chats) {
  const chatIdSelectEl = document.getElementById("chat_id");

  if (!chatIdSelectEl) {
    return;
  }

  chatIdSelectEl.setAttribute("disabled", true);
  chatIdSelectEl.innerHTML = `<option value="">Send to All</option>`;

  if (chats?.length && chatIdSelectEl) {
    chatIdSelectEl.removeAttribute("disabled");
    chatIdSelectEl.innerHTML += chats
      .map((id) => {
        return `<option value="${id}">${id}</option>`;
      })
      .join("");
  }
}

function initMessageForm(el, bots = []) {
  const markupEl = document.getElementById("markup");
  if (markupEl) {
    markupEl.innerHTML = ["markdown", "html"]
      .map((type) => {
        return `<option value="${type}">${type}</option>`;
      })
      .join("");
  }

  const botTokenSelectEl = document.getElementById("bot_token");

  if (bots?.length && botTokenSelectEl) {
    botTokenSelectEl.removeAttribute("disabled");
    botTokenSelectEl.innerHTML = `<option selected value="">Send to All</option>`;

    botTokenSelectEl.onchange = (e) => {
      const value = e.target.value;

      if (!value) {
        setChatIdSelect([]);
        return;
      }

      const chats = bots.find((bot) => bot.token === value)?.chats;

      setChatIdSelect(chats);
    };

    botTokenSelectEl.innerHTML += bots
      .map(({ token, webAppURL }) => {
        return `<option value="${token}">${webAppURL}</option>`;
      })
      .join("");
  }

  el.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const chat_id = formData.get("chat_id");
    const token = formData.get("token");
    const markup = formData.get("markup");
    const message = formData.get("message");

    try {
      const response = await fetch("/api/telegram/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, chat_id, message, markup }),
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
