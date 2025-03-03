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

  const onlineBots = bots?.filter((it) => it.active) || [];

  const botListEl = document.getElementById("bot-list");
  botListEl.innerHTML = "No bots found.";

  if (bots?.length) {
    botListEl.innerHTML = bots
      .map((it) => {
        return `
        <li>
          <span>${it.active ? "Online" : "Offline"}</span>
          <span>-</span>
          <strong>${it.webAppURL}</strong>
        </li>
      `;
      })
      .join("");
  }

  const hasBots = !!bots?.length;
  const allOnline = hasBots && onlineBots?.length === bots?.length;

  if (allOnline) {
    const offButton = document.createElement("button");
    offButton.textContent = "Stop all bots";
    offButton.addEventListener("click", async () => {
      await toggleBotStatus({ on: false }).then(() => {
        location.reload();
      });
    });

    botListEl.append(offButton);
  } else {
    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart all bots";
    restartButton.addEventListener("click", async () => {
      await toggleBotStatus({ on: true }).then(() => {
        location.reload();
      });
    });

    botListEl.append(restartButton);
  }

  initMessageForm(document.getElementById("message-form"), onlineBots);
}

// function setBotData(el) {
//   el?.addEventListener("submit", async (event) => {
//     event.preventDefault();
//     const formData = new FormData(event.target);

//     const token = formData.get("token");
//     const wepApp = formData.get("web-app");

//     try {
//       const response = await toggleBotStatus({ token, wepApp, status: true });

//       if (!response.ok) {
//         throw new Error(
//           response.statusText || `HTTP error! status: ${response.status}`
//         );
//       }

//       document.getElementById("message")?.classList.remove("hidden");
//       toggleBotStatusButton(true);

//       el.reset();
//     } catch (error) {
//       console.error("Error:", error.message);
//     }

//     el.reset();
//   });
// }

function toggleBotStatusButton(visible = false) {
  const stopBotEl = document.getElementById("stop-bot");
  stopBotEl?.classList?.toggle("hidden", !visible);
}

async function toggleBotStatus(payload) {
  return fetch("/api/telegram/power", {
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

function initMessageForm(formEl, bots = []) {
  const markupEl = document.getElementById("markup");
  if (markupEl) {
    markupEl.innerHTML = ["markdown", "html"]
      .map((type) => {
        return `<option value="${type}">${type}</option>`;
      })
      .join("");
  }

  if (!bots?.length) {
    markupEl?.setAttribute("disabled", true);
  }

  const botTokenSelectEl = document.getElementById("bot_token");

  const hasBots = bots?.length > 0;

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

  if (!formEl) {
    return;
  }

  if (hasBots) {
    formEl.removeAttribute("disabled");

    formEl.querySelectorAll("input, textarea, button").forEach((input) => {
      input.removeAttribute("disabled");
    });
  } else {
    formEl.setAttribute("disabled", true);

    formEl.querySelectorAll("input, textarea, button").forEach((input) => {
      input.setAttribute("disabled", true);
    });
  }

  formEl.addEventListener("submit", async (event) => {
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
      formEl.reset();
    } catch (error) {
      console.error("Error:", error.message);
    }

    formEl.reset();
  });
}
