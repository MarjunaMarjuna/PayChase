from fastapi import APIRouter
from pydantic import BaseModel

from ai_agent import get_ai_action


router = APIRouter(
    prefix="/ai",
    tags=["AI Agent"]
)


class AIRequest(BaseModel):
    invoice_number: str
    amount: float
    due_date: str
    status: str
    client_response: str = "No response yet"


@router.post("/analyze")
def analyze_invoice(data: AIRequest):

    result = get_ai_action(
        invoice_number=data.invoice_number,
        amount=data.amount,
        due_date=data.due_date,
        status=data.status,
        client_response=data.client_response
    )

    return result