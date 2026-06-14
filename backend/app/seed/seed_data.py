import random
from datetime import datetime, timedelta, timezone
from faker import Faker
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app.models import Base, Customer, Product, Order, OrderItem
from app.core.config import get_settings

from sqlalchemy.engine import make_url

fake = Faker("en_IN")
Faker.seed(42)
random.seed(42)

PRODUCTS = [
    # Footwear
    {"name": "Running Shoes", "category": "Footwear", "price": 4999.0},
    {"name": "Sneakers", "category": "Footwear", "price": 3999.0},
    {"name": "Training Shoes", "category": "Footwear", "price": 5499.0},
    {"name": "Trail Running Shoes", "category": "Footwear", "price": 6299.0},
    {"name": "Walking Shoes", "category": "Footwear", "price": 2999.0},
    {"name": "Basketball Shoes", "category": "Footwear", "price": 7499.0},
    {"name": "Casual Sneakers", "category": "Footwear", "price": 2499.0},
    # Clothing
    {"name": "T-Shirts", "category": "Clothing", "price": 999.0},
    {"name": "Jackets", "category": "Clothing", "price": 3499.0},
    {"name": "Track Pants", "category": "Clothing", "price": 1499.0},
    {"name": "Shorts", "category": "Clothing", "price": 799.0},
    {"name": "Hoodies", "category": "Clothing", "price": 2499.0},
    {"name": "Compression Tights", "category": "Clothing", "price": 1799.0},
    # Accessories
    {"name": "Caps", "category": "Accessories", "price": 599.0},
    {"name": "Sports Bags", "category": "Accessories", "price": 1999.0},
    {"name": "Socks", "category": "Accessories", "price": 299.0},
    {"name": "Water Bottles", "category": "Accessories", "price": 499.0},
    {"name": "Fitness Bands", "category": "Accessories", "price": 2999.0},
    {"name": "Wristbands", "category": "Accessories", "price": 199.0},
    {"name": "Sunglasses", "category": "Accessories", "price": 1499.0},
]

CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
    "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
    "Chandigarh", "Kochi", "Indore", "Bhopal", "Nagpur",
    "Gurgaon", "Noida", "Surat", "Vadodara", "Coimbatore",
]


def create_database_if_not_exists():
    settings = get_settings()
    try:
        db_url = make_url(settings.SYNC_DATABASE_URL)
        if not db_url.drivername.startswith("postgresql"):
            return
        
        db_name = db_url.database
        admin_url = db_url.set(database="postgres")
        
        # Connect to 'postgres' to verify/create database
        engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :dbname"),
                {"dbname": db_name}
            )
            exists = result.scalar()
            if not exists:
                print(f"Database '{db_name}' does not exist. Creating it...")
                conn.execute(text(f"CREATE DATABASE {db_name}"))
                print(f"Database '{db_name}' created successfully.")
            else:
                print(f"Database '{db_name}' already exists.")
    except Exception as e:
        print(f"Warning: Could not check/create database automatically: {e}")


def seed_database():
    create_database_if_not_exists()
    settings = get_settings()
    engine = create_engine(settings.SYNC_DATABASE_URL)

    # Create tables if not exist
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:
        # Check if data already exists
        existing = session.execute(text("SELECT COUNT(*) FROM customers")).scalar()
        if existing and existing > 0:
            print(f"Database already seeded with {existing} customers. Skipping.")
            return

        print("Seeding database...")

        # Seed products
        products = []
        for p_data in PRODUCTS:
            product = Product(**p_data)
            session.add(product)
            products.append(product)
        session.flush()
        print(f"  Created {len(products)} products")

        # Seed customers
        customers = []
        used_emails = set()
        for i in range(1000):
            email = fake.unique.email()
            while email in used_emails:
                email = fake.unique.email()
            used_emails.add(email)

            customer = Customer(
                name=fake.name(),
                email=email,
                phone=f"+91{fake.msisdn()[3:13]}",
                city=random.choice(CITIES),
                created_at=fake.date_time_between(
                    start_date="-18m", end_date="-1m",
                    tzinfo=timezone.utc
                ),
            )
            session.add(customer)
            customers.append(customer)
        session.flush()
        print(f"  Created {len(customers)} customers")

        # Seed orders
        order_count = 0
        item_count = 0
        for _ in range(5000):
            customer = random.choice(customers)
            num_items = random.randint(1, 5)
            order_products = random.sample(products, min(num_items, len(products)))

            total = 0.0
            order_items = []
            for prod in order_products:
                qty = random.randint(1, 3)
                item_price = prod.price
                total += item_price * qty
                order_items.append((prod.id, qty, item_price))

            order = Order(
                customer_id=customer.id,
                total_amount=round(total, 2),
                order_date=fake.date_time_between(
                    start_date="-12m", end_date="now",
                    tzinfo=timezone.utc
                ),
            )
            session.add(order)
            session.flush()

            for prod_id, qty, price in order_items:
                oi = OrderItem(
                    order_id=order.id,
                    product_id=prod_id,
                    quantity=qty,
                    price=price,
                )
                session.add(oi)
                item_count += 1

            order_count += 1
            if order_count % 500 == 0:
                session.flush()
                print(f"  Created {order_count} orders...")

        session.commit()
        print(f"  Created {order_count} orders with {item_count} items")
        print("Database seeding complete!")


if __name__ == "__main__":
    seed_database()
