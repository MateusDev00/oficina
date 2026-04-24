# tools.py
from langchain.tools import tool
from db import get_connection
from datetime import datetime, time

# ------------------- CONSULTA DE STATUS -------------------
def obter_status_ordem(ordem_id: int = None, telefone: str = None):
    """Busca informações da ordem de serviço."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        if ordem_id:
            cursor.execute("""
                SELECT o.id, u.nome, u.telefone, v.marca, v.modelo, v.matricula, o.estado, o.data_agendada
                FROM ordens_servico o
                JOIN utilizadores u ON o.cliente_id = u.id
                JOIN veiculos v ON o.veiculo_id = v.id
                WHERE o.id = %s
            """, (ordem_id,))
        elif telefone:
            cursor.execute("""
                SELECT o.id, u.nome, u.telefone, v.marca, v.modelo, v.matricula, o.estado, o.data_agendada
                FROM ordens_servico o
                JOIN utilizadores u ON o.cliente_id = u.id
                JOIN veiculos v ON o.veiculo_id = v.id
                WHERE u.telefone = %s
                ORDER BY o.criado_em DESC
                LIMIT 1
            """, (telefone,))
        else:
            return None
        return cursor.fetchone()
    finally:
        conn.close()

def gerar_mensagem_status(ordem_id: int = None, telefone: str = None):
    dados = obter_status_ordem(ordem_id, telefone)
    if not dados:
        return "Não encontrei nenhuma ordem de serviço com esses dados."
    id_os, nome, telefone_cliente, marca, modelo, matricula, estado, data_agendada = dados
    data_str = data_agendada.strftime("%d/%m/%Y") if data_agendada else "não agendada"
    return (
        f"Ordem de Serviço #{id_os}\n"
        f"Cliente: {nome} ({telefone_cliente})\n"
        f"Veículo: {marca} {modelo} - Matrícula {matricula}\n"
        f"Status: {estado}\n"
        f"Data agendada: {data_str}"
    )

@tool
def consultar_status_tool(consulta: str) -> str:
    """
    Ferramenta para consultar o status de uma ordem de serviço.
    A consulta pode ser o número da OS (ex: 'OS 15') ou o telefone do cliente.
    """
    # Tenta extrair número da OS ou telefone
    import re
    # Procura por dígitos
    numeros = re.findall(r'\d+', consulta)
    if not numeros:
        return "Por favor, informe o número da ordem de serviço ou o telefone do cliente."
    
    # Se tem 9 dígitos, assume que é telefone
    valor = numeros[0]
    if len(valor) >= 9:
        return gerar_mensagem_status(telefone=valor)
    else:
        try:
            ordem_id = int(valor)
            return gerar_mensagem_status(ordem_id=ordem_id)
        except:
            return "Não consegui identificar o número da OS. Tente novamente."

# ------------------- AGENDAMENTO -------------------
def verificar_disponibilidade(data_desejada: str, hora_desejada: str):
    """
    Verifica se há técnicos disponíveis na data/hora informada,
    considerando o horário de funcionamento.
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Converte strings para objetos de data/hora
        from datetime import datetime, time
        data_obj = datetime.strptime(data_desejada, "%Y-%m-%d").date()
        hora_obj = datetime.strptime(hora_desejada, "%H:%M").time()
        
        # Verifica dia da semana e horário de funcionamento
        dias_semana_pt = {
            0: "domingo", 1: "segunda", 2: "terca", 3: "quarta",
            4: "quinta", 5: "sexta", 6: "sabado"
        }
        dia_semana = dias_semana_pt[data_obj.weekday()]
        cursor.execute("""
            SELECT abertura, fechamento, ativo
            FROM horario_funcionamento
            WHERE dia_semana = %s
        """, (dia_semana,))
        horario = cursor.fetchone()
        if not horario or not horario["ativo"]:
            return False, "A oficina não funciona neste dia."
        abertura = horario["abertura"]
        fechamento = horario["fechamento"]
        if not (abertura <= hora_obj <= fechamento):
            return False, f"Horário fora do expediente ({abertura.strftime('%H:%M')} às {fechamento.strftime('%H:%M')})."
        
        # Conta técnicos disponíveis na data
        cursor.execute("""
            SELECT COUNT(*) as total
            FROM disponibilidade_tecnico dt
            JOIN utilizadores u ON dt.tecnico_id = u.id
            WHERE dt.data = %s
              AND dt.disponivel = TRUE
              AND u.papel = 'tecnico'
              AND u.disponivel = TRUE
        """, (data_obj,))
        resultado = cursor.fetchone()
        total = resultado["total"] if resultado else 0
        if total == 0:
            return False, "Não há técnicos disponíveis nesta data/horário."
        return True, f"Há {total} técnico(s) disponível(is)."
    finally:
        conn.close()

@tool
def agendar_servico_tool(dados_cliente: str) -> str:
    """
    Ferramenta para agendar um novo serviço.
    Espera receber uma string contendo: nome, telefone, veículo (marca/modelo/matrícula),
    data desejada (AAAA-MM-DD), hora (HH:MM) e descrição do serviço.
    """
    # Em uma implementação real, aqui você extrairia os dados com regex ou usaria structured tools.
    # Para simplificar, vamos simular que os dados já vêm estruturados de um formulário no frontend.
    # O agente chamará essa ferramenta quando o usuário confirmar o agendamento.
    return "Funcionalidade de agendamento será implementada com os dados recebidos do frontend."