import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

def obter_conexao():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL não definida")
    if "?pgbouncer=true" not in database_url:
        database_url += "?pgbouncer=true"
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def executar_query(query: str, parametros: tuple = None):
    conn = obter_conexao()
    try:
        with conn.cursor() as cur:
            cur.execute(query, parametros)
            if cur.description:
                return cur.fetchall()
            conn.commit()
    finally:
        conn.close()