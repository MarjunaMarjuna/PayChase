from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routes.auth_routes import router as auth_router
from routes.invoices import router as invoice_router
from routes.payments import router as payment_router
from routes.ai_routes import router as ai_router



app = FastAPI(title="PayChase API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(invoice_router)
app.include_router(payment_router)
app.include_router(ai_router)




@app.get("/")
def root():
    return {
        "message": "PayChase Backend is running!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }