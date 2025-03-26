from app import app,db, User
from werkzeug.security import generate_password_hash
import uuid
with app.app_context():
    # Create admin user
    admin = User(
        public_id=str(uuid.uuid4()),
        username="admin",
        password=generate_password_hash("123456789", method='scrypt'),
        role="admin"
    )

    # Add and commit the user
    db.session.add(admin)
    db.session.commit()

    print("Admin user created successfully!")