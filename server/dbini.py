from app import app, db, User
from werkzeug.security import generate_password_hash
import uuid

with app.app_context():  # Ensure the app context is active
    # Initialize the database
    db.create_all()

    # Create an admin user
    admin_username = "admin"
    admin_password = "admin123"  # Change to a secure password
    admin_role = "admin"

    if not User.query.filter_by(username=admin_username).first():
        hashed_password = generate_password_hash(admin_password, method='scrypt')
        admin_user = User(
            public_id=str(uuid.uuid4()),
            username=admin_username,
            password=hashed_password,
            role=admin_role
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Admin user created successfully.")
    else:
        print("Admin user already exists.")
