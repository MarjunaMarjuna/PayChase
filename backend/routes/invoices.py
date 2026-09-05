from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date

from database import get_db
from models import Invoice

router = APIRouter(prefix="/invoices", tags=["Invoices"])


class InvoiceCreate(BaseModel):
    invoice_number: str
    client_id: int
    amount: float
    due_date: date


@router.post("/")
def create_invoice(
    data: InvoiceCreate,
    db: Session = Depends(get_db)
):
    invoice = Invoice(
        invoice_number=data.invoice_number,
        client_id=data.client_id,
        amount=data.amount,
        due_date=data.due_date,
        status="PENDING"
    )

    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    return invoice


@router.get("/")
def get_invoices(db: Session = Depends(get_db)):
    return db.query(Invoice).all()


@router.get("/{client_id}")
def get_client_invoice(
    client_id: int,
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(
        Invoice.client_id == client_id
    ).first()

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    return invoice