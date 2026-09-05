from database import SessionLocal
from models import User
from auth import hash_password


def create_demo_users():
    db = SessionLocal()

    users = [
        {
            "name": "PayChase Admin",
            "email": "admin@paychase.com",
            "password": "Admin@123",
            "role": "ADMIN"
        },
        {
            "name": "Client One",
            "email": "client1@paychase.com",
            "password": "Client@123",
            "role": "CLIENT"
        },
        {
            "name": "Client Two",
            "email": "client2@paychase.com",
            "password": "Client@123",
            "role": "CLIENT"
        },
        {
            "name": "Client Three",
            "email": "client3@paychase.com",
            "password": "Client@123",
            "role": "CLIENT"
        },
        {
            "name": "Client Four",
            "email": "client4@paychase.com",
            "password": "Client@123",
            "role": "CLIENT"
        }
    ]

    for user_data in users:
        existing = db.query(User).filter(
            User.email == user_data["email"]
        ).first()

        if not existing:
            user = User(
                name=user_data["name"],
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                role=user_data["role"]
            )
            db.add(user)

    db.commit()
    db.close()

    print("Demo users created successfully!")


if __name__ == "__main__":
    create_demo_users()