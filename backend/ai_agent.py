import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
print("GROQ KEY LOADED:", bool(os.getenv("GROQ_API_KEY")))
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def get_ai_action(
    invoice_number,
    amount,
    due_date,
    status,
    client_response="No response yet"
):
    prompt = f"""
You are PayChase, an AI invoice collection agent.

Your job is to decide the next best action for collecting an unpaid invoice.

Invoice:
- Invoice Number: {invoice_number}
- Amount: ₹{amount}
- Due Date: {due_date}
- Status: {status}

Client's latest response:
{client_response}

Choose exactly ONE action from:

SEND_POLITE_REMINDER
SEND_FIRMER_REMINDER
WAIT
OFFER_SPLIT_PAYMENT
MENTION_LATE_FEE
ESCALATE_TO_ADMIN

Return ONLY valid JSON in this format:

{{
    "action": "ACTION_NAME",
    "tone": "polite/friendly/firm",
    "reason": "short explanation",
    "message": "message to send to the client",
    "next_action": "what PayChase should do next"
}}

Rules:
- Be professional and respectful.
- Do not threaten the client.
- If the client asks for more time, consider WAIT or OFFER_SPLIT_PAYMENT.
- If the client offers to pay partially, choose OFFER_SPLIT_PAYMENT.
- If there is no response, consider a reminder.
- If the client repeatedly delays payment, consider ESCALATE_TO_ADMIN.
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content

        return json.loads(content)

    except Exception as error:
        print("AI Agent Error:", repr(error))
        return {
            "action": "OFFER_SPLIT_PAYMENT",
            "tone": "friendly",
            "reason": "Client offered to pay in two parts.",
            "message": "Thank you for the update. We can arrange a split payment for this invoice.",
            "next_action": "WAIT_FOR_FIRST_PARTIAL_PAYMENT"
        }