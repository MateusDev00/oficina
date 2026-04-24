from apscheduler.schedulers.background import  BackgroundScheduler
from tools import  gerar_mensagem
from db import  get_conection

def verificar_produto():
    conn=get_conection()
    cursor=conn.cursor()

    cursor.execute("SELECT id FROM produtos")
    produtos=cursor.fetchall()
    conn.close()

    for p in produtos:
        mensagem= gerar_mensagem(p[0])
        print(mensagem) # wi aqui escole que metodo usar para o enviu de sms

def iniciar_scheduler():
    scheduler=BackgroundScheduler()
    scheduler.add_job(
        verificar_produto,
        'interval',
        days=2 #wy aqui escole o tempo de verificação
    )
    scheduler.start()