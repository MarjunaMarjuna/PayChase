import { useEffect, useState } from "react";

function ClientDashboard() {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Get logged-in user
  const user = JSON.parse(
    localStorage.getItem("paychase_user")
  );

  // Dynamically use logged-in client's ID
  const clientId = user?.user_id;

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    fetch(`http://127.0.0.1:8000/invoices/${clientId}`)
      .then((response) => response.json())
      .then((data) => {
        setInvoice(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [clientId]);

  // Razorpay Payment
  const handlePayment = async () => {
    try {
      setPaymentLoading(true);

      const response = await fetch(
        `http://127.0.0.1:8000/payments/create-order/${invoice.id}`,
        {
          method: "POST",
        }
      );

      const order = await response.json();

      if (!response.ok) {
        alert(
          order.detail ||
            "Unable to create payment order"
        );
        setPaymentLoading(false);
        return;
      }

      const options = {
        key: order.razorpay_key_id,
        amount: order.amount * 100,
        currency: "INR",
        name: "PayChase",
        description: `Payment for ${order.invoice_number}`,
        order_id: order.razorpay_order_id,

        handler: async function (paymentResponse) {
          console.log(
            "Payment successful:",
            paymentResponse
          );

          try {
            const verifyResponse = await fetch(
              "http://127.0.0.1:8000/payments/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  invoice_id: invoice.id,
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,
                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,
                  razorpay_signature:
                    paymentResponse.razorpay_signature,
                }),
              }
            );

            const result =
              await verifyResponse.json();

            if (!verifyResponse.ok) {
              alert(
                result.detail ||
                  "Payment verification failed"
              );
              return;
            }

            alert(
              "Payment verified successfully! ✅"
            );

            setInvoice((previousInvoice) => ({
              ...previousInvoice,
              status: "PAID",
            }));

          } catch (error) {
            console.error(
              "Verification error:",
              error
            );

            alert(
              "Payment verification failed."
            );
          }
        },

        // Dynamic client information
        prefill: {
          name: user?.name || "PayChase Client",
          email: user?.email || "",
        },

        theme: {
          color: "#3399cc",
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response.error
          );

          alert(
            "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();

    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      alert(
        "Payment could not be started."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading invoice...</h2>;
  }

  if (!clientId) {
    return (
      <h2>
        User session not found. Please login again.
      </h2>
    );
  }

  if (!invoice) {
    return <h2>Invoice not found</h2>;
  }

  return (
    <div
      style={{
        padding: "40px",
        background: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      <h1>💰 PayChase</h1>

      <h2>Client Dashboard</h2>

      <p>
        Welcome, <strong>{user?.name}</strong> 👋
      </p>

      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          maxWidth: "500px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h3>📄 Invoice Details</h3>

        <p>
          <strong>Invoice:</strong>{" "}
          {invoice.invoice_number}
        </p>

        <p>
          <strong>Amount:</strong> ₹
          {invoice.amount}
        </p>

        <p>
          <strong>Due Date:</strong>{" "}
          {invoice.due_date}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {invoice.status === "PAID" ||
          invoice.status === "COMPLETED"
            ? "PAID ✅"
            : "PENDING ⏳"}
        </p>

        {invoice.status !== "PAID" &&
          invoice.status !== "COMPLETED" && (
            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              style={{
                padding: "12px 25px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {paymentLoading
                ? "Processing..."
                : "💳 Pay Now"}
            </button>
          )}

        {(invoice.status === "PAID" ||
          invoice.status === "COMPLETED") && (
          <p
            style={{
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            Payment Completed ✅
          </p>
        )}
      </div>
    </div>
  );
}

export default ClientDashboard;