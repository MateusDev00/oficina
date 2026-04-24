from db import  get_conection

def criar_tabelas():
    conn=get_conection()
    cursor=conn.cursor()

    cursor.execute("""
     CREATE TABLE NOT EXISTS agendamentos(
      #esta BD so usei para simular um agendamento não é a BD de prodção cona da tua mãe
       id  SERIAL PRIMARY KEY,
       nome TEXT,
       data TEXT,
       hora TEXT
     
     )
    """)
    conn.commit()
    conn.close()
