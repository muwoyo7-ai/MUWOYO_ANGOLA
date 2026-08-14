import React, { useState } from "react";
import { initWebPush } from "@/lib/web-push";

export default function NotificationButton() {
  const [subscribed, setSubscribed] = useState(false);
  const [info, setInfo] = useState("");

  async function handleSubscribe() {
    try {
      const result = await initWebPush();
      setSubscribed(!!result.ok);
      setInfo(result.ok ? "Inscrito com sucesso." : `Falha: ${result.reason || ""}`);
    } catch (err) {
      console.error(err);
      setInfo("Falha ao subscrever: " + (err.message || err));
    }
  }

  return (
    <div>
      <button onClick={handleSubscribe} disabled={subscribed} className="btn">
        {subscribed ? "Subscrito" : "Ativar notificações"}
      </button>
      {info && <div style={{ marginTop: 8 }}>{info}</div>}
    </div>
  );
}
