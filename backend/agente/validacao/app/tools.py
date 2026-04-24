from db import  get_conection
from datetime import  datetime,timedelta

def verificar_disponibilidade(data,hora):
    conn= get_conection()
    cursor=conn.cursor()

    cursor.execute(

        "SELECT * FROM agendamento WHERE data=%s AND hora=%s",(data,hora)


    )
    resultado=cursor.fetchone()
    conn.close()

    return resultado is None

def criar_agendamento(nome,data,hora):
    conn= get_conection()
    cursor = conn.cursor()

    cursor.execute(

        "INSERT INTO agendamentos (nome,data,hora) VALUES(%s,%s,%s)",
        (nome,data,hora)
    )
    conn.commit()
    conn.close()

    return "Agendado com sucesso"

def sugerir_horario(data,hora):
    base=datetime.strptime(f"{data} {hora}","%y-%m-%d %H:%M")

    for i in range(1,6):
        novo=base + timedelta(hours=i)
        if verificar_disponibilidade(
            novo.strptime("%Y-%m-%d"),
            novo.strptime("%H:%M")
        ):
            return f"{novo.strftime('%Y-%m-%d')} as {novo.strftime('%H:%M')}"
    return "sem horarios disponiveis "

def agendar (nome,data,hora):
    try:
        datetime.strptime(data,"%y-%m-%d")
    except:
        return "Data invalida"

    #validação de dias uteis
    if datetime.strptime(data,"%Y-%m-%d").weekday() >=5:
        return  "so dias uteis e laborais "

    #validação de horarios
    hora_int=int(hora.split(":")[0])
    if not(8<= hora_int<18):
        return  "fora do horario"
    #velificar a disponibilidade
    if not verificar_disponibilidade(data, hora):
        return f"O cupado sugestão: {sugerir_horario(data, hora)}"
    return criar_agendamento(nome, data, hora)