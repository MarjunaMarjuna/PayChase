import { useEffect, useState } from "react";

function AdminDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiResults, setAiResults] = useState({});
  const [selectedResponses, setSelectedResponses] = useState({});

  useEffect(() => {
    fetch("http://127.0.0.1:8000/invoices/")
      .then((response) => response.json())
      .then((data) => {
        setInvoices(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const analyzeInvoice = async (invoice) => {
    const clientResponse =
      selectedResponses[invoice.id] || "No response yet";

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/ai/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoice_number: invoice.invoice_number,
            amount: invoice.amount,
            due_date: invoice.due_date,
            status: invoice.status,
            client_response: clientResponse,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "AI Agent failed");
        return;
      }

      setAiResults((previous) => ({
        ...previous,
        [invoice.id]: data,
      }));
    } catch (error) {
      console.error("AI Error:", error);
      alert("Unable to connect to AI Agent");
    }
  };

  const handleResponseChange = (invoiceId, value) => {
    setSelectedResponses((previous) => ({
      ...previous,
      [invoiceId]: value,
    }));
  };

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Loading Admin Dashboard...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            marginBottom: "5px",
            color: "#222",
          }}
        >
          💰 PayChase
        </h1>

        <h2
          style={{
            color: "#333",
            marginTop: "5px",
          }}
        >
          Admin Dashboard 👨‍💼
        </h2>

        <p
          style={{
            fontSize: "18px",
            color: "#555",
          }}
        >
          <strong>Total Invoices:</strong>{" "}
          {invoices.length}
        </p>
      </div>

      <hr />

      {/* INVOICES */}
      <div
        style={{
          maxWidth: "800px",
          margin: "30px auto",
        }}
      >
        {invoices.map((invoice) => {
          const ai = aiResults[invoice.id];

          const isPaid =
            invoice.status === "PAID" ||
            invoice.status === "COMPLETED";

          return (
            <div
              key={invoice.id}
              style={{
                background: "white",
                borderRadius: "14px",
                padding: "25px",
                marginBottom: "25px",
                boxShadow:
                  "0 4px 15px rgba(0,0,0,0.08)",
              }}
            >
              {/* INVOICE HEADER */}
              <h2
                style={{
                  marginTop: 0,
                  color: "#333",
                }}
              >
                📄 {invoice.invoice_number}
              </h2>

              <p>
                <strong>Client ID:</strong>{" "}
                {invoice.client_id}
              </p>

              <p>
                <strong>Amount:</strong> ₹
                {invoice.amount}
              </p>

              <p>
                <strong>Due Date:</strong>{" "}
                {invoice.due_date}
              </p>

              {/* STATUS */}
              <p>
                <strong>Status:</strong>{" "}
                {isPaid ? (
                  <span
                    style={{
                      color: "green",
                      fontWeight: "bold",
                    }}
                  >
                    PAID ✅
                  </span>
                ) : (
                  <span
                    style={{
                      color: "#d97706",
                      fontWeight: "bold",
                    }}
                  >
                    PENDING ⏳
                  </span>
                )}
              </p>

              {/* PAID INVOICE */}
              {isPaid && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    background: "#ecfdf5",
                    borderRadius: "10px",
                    textAlign: "center",
                  }}
                >
                  <strong
                    style={{
                      color: "green",
                      fontSize: "17px",
                    }}
                  >
                    Payment Completed ✅
                  </strong>

                  <p
                    style={{
                      marginBottom: 0,
                      color: "#555",
                    }}
                  >
                    No further collection action required.
                  </p>
                </div>
              )}

              {/* PENDING INVOICE */}
              {!isPaid && (
                <>
                  <hr
                    style={{
                      margin: "20px 0",
                    }}
                  />

                  <h3
                    style={{
                      color: "#333",
                    }}
                  >
                    🧠 Client Response Scenario
                  </h3>

                  <select
                    value={
                      selectedResponses[invoice.id] ||
                      "No response yet"
                    }
                    onChange={(e) =>
                      handleResponseChange(
                        invoice.id,
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "15px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="No response yet">
                      🤐 No response
                    </option>

                    <option value="I can pay half this week and the remaining amount next week.">
                      💰 I want to split the payment
                    </option>

                    <option value="I will pay the full amount tomorrow.">
                      📅 I will pay tomorrow
                    </option>

                    <option value="I cannot pay the full amount right now.">
                      😟 I cannot pay the full amount
                    </option>
                  </select>

                  <button
                    onClick={() =>
                      analyzeInvoice(invoice)
                    }
                    style={{
                      marginTop: "15px",
                      padding: "12px 22px",
                      border: "none",
                      borderRadius: "8px",
                      background: "#333",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "15px",
                    }}
                  >
                    🤖 Ask AI Agent
                  </button>

                  {/* AI RESULT */}
                  {ai && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "20px",
                        background: "#f0f4ff",
                        borderRadius: "12px",
                        border: "1px solid #dbe4ff",
                      }}
                    >
                      <h3
                        style={{
                          marginTop: 0,
                        }}
                      >
                        🤖 AI Agent Decision
                      </h3>

                      <p>
                        <strong>Action:</strong>{" "}
                        {ai.action}
                      </p>

                      <p>
                        <strong>Tone:</strong>{" "}
                        {ai.tone}
                      </p>

                      <p>
                        <strong>Reason:</strong>{" "}
                        {ai.reason}
                      </p>

                      <p>
                        <strong>Message:</strong>{" "}
                        {ai.message}
                      </p>

                      <p>
                        <strong>Next Action:</strong>{" "}
                        {ai.next_action}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminDashboard;