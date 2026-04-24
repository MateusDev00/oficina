import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    """Retorna uma conexão com o Supabase usando a DATABASE_URL."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL não configurada no ambiente.")
    
    # Garantir que o parâmetro pgbouncer esteja presente
    if "?pgbouncer=true" not in database_url:
        database_url += "?pgbouncer=true"
    
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)