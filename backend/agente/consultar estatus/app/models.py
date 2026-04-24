from db import  get_conection

def criar_tabelas():
    conn=get_conection()
    cursor=conn.cursor()

    cursor.execute(

        """
        CREATE TABLE IF NOT EXISTS produtos(
         
         id SERIAL PRIMARY KEY,
         nome TEXT,
         cliente TEXT,
         status TEXT
        )"""

    )
    conn.commit()
    conn.close()