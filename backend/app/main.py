from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.database import engine
from app.routers.accounts import router as accounts_router
from app.routers.analytics import router as analytics_router
from app.routers.auth import router as auth_router
from app.routers.bills import router as bills_router
from app.routers.budgets import router as budgets_router
from app.routers.categories import router as categories_router
from app.routers.summary import router as summary_router
from app.routers.lendings import router as lendings_router
from app.routers.transactions import router as transactions_router
from app.routers.audit_logs import router as audit_logs_router


app = FastAPI(title="Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://zuzu-brown.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(bills_router)
app.include_router(accounts_router)
app.include_router(analytics_router)
app.include_router(budgets_router)
app.include_router(categories_router)
app.include_router(transactions_router)
app.include_router(summary_router)
app.include_router(lendings_router)
app.include_router(audit_logs_router)


@app.get("/")
def root():
    return {
        "message": "Expense Tracker API is running"
    }


@app.get("/db-test")
def database_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {
            "database": "connected",
            "result": result.scalar()
        }
