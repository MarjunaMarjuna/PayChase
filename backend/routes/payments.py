from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Invoice
from razorpay_service import create_order, client


router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


# -------------------------------
# Create Razorpay Order
# -------------------------------

@router.post("/create-order/{invoice_id}")
def create_payment_order(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id
    ).first()

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    if invoice.status == "PAID":
        raise HTTPException(
            status_code=400,
            detail="Invoice is already paid"
        )

    order = create_order(
        invoice.amount,
        invoice.invoice_number
    )

    invoice.razorpay_order_id = order["id"]

    db.commit()

    return {
        "invoice_id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "amount": invoice.amount,
        "razorpay_order_id": order["id"],
        "razorpay_key_id": order.get("key_id")
    }


# -------------------------------
# Payment Verification
# -------------------------------

class PaymentVerify(BaseModel):
    invoice_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/verify")
def verify_payment(
    data: PaymentVerify,
    db: Session = Depends(get_db)
):

    invoice = db.query(Invoice).filter(
        Invoice.id == data.invoice_id
    ).first()

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    try:

        # Verify Razorpay payment signature
        client.utility.verify_payment_signature({
            "razorpay_order_id": data.razorpay_order_id,
            "razorpay_payment_id": data.razorpay_payment_id,
            "razorpay_signature": data.razorpay_signature
        })

        # Payment verified successfully
        invoice.status = "PAID"

        db.commit()
        db.refresh(invoice)

        return {
            "message": "Payment verified successfully",
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "status": invoice.status
        }

    except Exception as error:

        print("Payment verification error:", error)

        raise HTTPException(
            status_code=400,
            detail="Payment verification failed"
        )