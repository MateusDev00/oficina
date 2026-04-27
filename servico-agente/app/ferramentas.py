from langchain.tools import tool
from app.base_de_dados import executar_query
from datetime import datetime, date

@tool
def consultar_status_ordem(ordem_id: int = None, telefone_cliente: str = None) -> str:
    """Consulta o estado atual de uma ordem de serviço pelo ID ou pelo telefone do cliente."""
    if ordem_id:
        query = """
            SELECT o.id, u.nome, u.telefone, v.matricula, v.marca, v.modelo, o.estado, o.data_agendada
            FROM ordens_servico o
            JOIN utilizadores u ON o.cliente_id = u.id
            JOIN veiculos v ON o.veiculo_id = v.id
            WHERE o.id = %s
        """
        resultado = executar_query(query, (ordem_id,))
    elif telefone_cliente:
        query = """
            SELECT o.id, u.nome, u.telefone, v.matricula, v.marca, v.modelo, o.estado, o.data_agendada
            FROM ordens_servico o
            JOIN utilizadores u ON o.cliente_id = u.id
            JOIN veiculos v ON o.veiculo_id = v.id
            WHERE u.telefone = %s
            ORDER BY o.criado_em DESC
            LIMIT 1
        """
        resultado = executar_query(query, (telefone_cliente,))
    else:
        return "É necessário fornecer o número da OS ou telefone do cliente."

    if not resultado:
        return "Nenhuma ordem encontrada."

    ordem = resultado[0]
    data_str = ordem['data_agendada'].strftime('%d/%m/%Y') if ordem.get('data_agendada') else 'não agendada'
    return (
        f"OS #{ordem['id']} - {ordem['nome']} ({ordem['telefone']})\n"
        f"Veículo: {ordem['marca']} {ordem['modelo']} ({ordem['matricula']})\n"
        f"Estado: {ordem['estado']}\n"
        f"Data agendada: {data_str}"
    )

@tool
def verificar_disponibilidade(data_str: str) -> str:
    """Verifica se há técnicos disponíveis numa determinada data (formato AAAA-MM-DD)."""
    data_obj = datetime.strptime(data_str, '%Y-%m-%d').date()
    dia_semana = ['segunda','terça','quarta','quinta','sexta','sábado','domingo'][data_obj.weekday()]

    horario = executar_query(
        "SELECT abertura, fechamento, ativo FROM horario_funcionamento WHERE dia_semana = %s",
        (dia_semana,)
    )
    if not horario or not horario[0]['ativo']:
        return f"A oficina está fechada às {dia_semana}s."

    tecnicos = executar_query(
        """SELECT COUNT(*) as total FROM disponibilidade_tecnico dt
           JOIN utilizadores u ON dt.tecnico_id = u.id
           WHERE dt.data = %s AND dt.disponivel = TRUE AND u.disponivel = TRUE""",
        (data_obj,)
    )
    total = tecnicos[0]['total']
    vagas = total * 3

    ordens = executar_query(
        "SELECT COUNT(*) as total FROM ordens_servico WHERE data_agendada = %s",
        (data_obj,)
    )
    ocupadas = ordens[0]['total']
    restantes = max(0, vagas - ocupadas)

    return f"Data: {data_str}. Técnicos disponíveis: {total}. Vagas restantes: {restantes}."

@tool
def criar_agendamento(cliente_id: int, veiculo_id: int, descricao: str, data_agendada: str) -> str:
    """Cria uma nova ordem de serviço (agendamento). Retorna o ID da OS criada."""
    query = """
        INSERT INTO ordens_servico (cliente_id, veiculo_id, descricao, data_agendada, estado, prioridade)
        VALUES (%s, %s, %s, %s, 'pendente', 'media')
        RETURNING id
    """
    resultado = executar_query(query, (cliente_id, veiculo_id, descricao, data_agendada))
    if resultado:
        return f"Agendamento criado com sucesso. OS #{resultado[0]['id']}"
    return "Falha ao criar agendamento."

@tool
def listar_veiculos_cliente(cliente_id: int) -> str:
    """Lista os veículos cadastrados de um cliente."""
    resultado = executar_query(
        "SELECT id, matricula, marca, modelo FROM veiculos WHERE cliente_id = %s",
        (cliente_id,)
    )
    if not resultado:
        return "Nenhum veículo encontrado."
    linhas = [f"ID {v['id']}: {v['marca']} {v['modelo']} ({v['matricula']})" for v in resultado]
    return "\n".join(linhas)

@tool
def sugerir_tecnico(ordem_id: int) -> str:
    """Sugere o técnico mais adequado para uma ordem, com base na carga atual."""
    ordem = executar_query("SELECT descricao FROM ordens_servico WHERE id = %s", (ordem_id,))
    if not ordem:
        return "Ordem não encontrada."

    tecnico = executar_query(
        """SELECT u.id, u.nome, u.especialidade, COUNT(o.id) as carga
           FROM utilizadores u
           LEFT JOIN ordens_servico o ON u.id = o.tecnico_id AND o.estado IN ('pendente','em_andamento')
           WHERE u.papel = 'tecnico' AND u.disponivel = TRUE
           GROUP BY u.id
           ORDER BY carga ASC
           LIMIT 1"""
    )
    if not tecnico:
        return "Nenhum técnico disponível."

    t = tecnico[0]
    return f"Técnico sugerido: {t['nome']} ({t['especialidade'] or 'Geral'}), carga atual: {t['carga']} ordens."