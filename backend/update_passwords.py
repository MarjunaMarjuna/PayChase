from database import SessionLocal
from models import User
from auth import hash_password

db = SessionLocal()

passwords = {
    "admin@paychase.com": "Admin@123",
    "client1@paychase.com": "Client1@123",
    "client2@paychase.com": "Client2@123",
    "client3@paychase.com": "Client3@123",
    "client4@paychase.com": "Client4@123",
}

for email, password in passwords.items():
    user = db.query(User).filter(User.email == email).first()

    if user:
        user.password_hash = hash_password(password)
        print(f"Updated: {email}")

db.commit()
db.close()

print("All passwords updated successfully!")