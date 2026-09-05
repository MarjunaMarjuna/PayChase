import os
import razorpay
from dotenv import load_dotenv

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

client = razorpay.Client(
    auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
)


def create_order(amount: float, invoice_number: str):
    order = client.order.create({
        "amount": int(amount * 100),
        "currency": "INR",
        "receipt": invoice_number
    })

    order["key_id"] = RAZORPAY_KEY_ID

    return order