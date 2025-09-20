document.addEventListener("DOMContentLoaded", function () {
    let openChatBotButton = document.getElementById("openChatBot");
  
    if (!openChatBotButton) {
      openChatBotButton = document.createElement("button");
      openChatBotButton.id = "openChatBot";
      openChatBotButton.innerText = "Bot Clínica";
      Object.assign(openChatBotButton.style, {
        position: "fixed",
        bottom: "20px",
        right: "50px",
        backgroundColor: "#beb36f",
        color: "black",
        border: "1px solidrgb(1, 1, 1)",
        borderRadius: "120px",
        padding: "25px 50px",
        fontSize: "16px",
        cursor: "pointer",
        zIndex: "1000",
      });
      document.body.appendChild(openChatBotButton);
    }
  
    openChatBotButton.addEventListener("click", function () {
      window.botpressWebChat.toggle();
    });
  });
  