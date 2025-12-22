from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    SQLAlchemy Declarative Base

    - 全ての ORM モデルはこの Base を継承する
    - Alembic の autogenerate は Base.metadata を参照する
    """

    pass
