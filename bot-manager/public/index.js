document.addEventListener("DOMContentLoaded", start);

function start() {
  const formEl = document.getElementById("message-form");
  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
	const formData = new FormData(event.target);

	const id = formData.get("id");
    const message = formData.get("message");

    try {
      const response = await fetch("/api/telegram/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, message }),
      });

      if (!response.ok) {
        throw new Error(response.statusText || `HTTP error! status: ${response.status}`);
      }

      await response.json();
	  formEl.reset();
    } catch (error) {
      console.error("Error:", error.message);
    }

	formEl.reset();
  });
}
