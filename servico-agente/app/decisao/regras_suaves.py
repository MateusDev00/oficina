async def decidir_com_ia(model, tipo_evento: str, payload: dict, ferramentas: list) -> dict:
    # Constrói um prompt para o LLM decidir ações
    prompt = f"""
    És um gestor de oficina. Recebeste o evento '{tipo_evento}' com os dados: {payload}.
    Que ações deves tomar? Escolhe entre:
    - notificar_cliente
    - reagendar_ordem
    - priorizar_ordem
    - sugerir_tecnico
    - realocar_ordens
    Responde apenas com a lista de ações e parâmetros em JSON.
    """
    # Aqui utilizarias o modelo, mas para simplicidade, devolvemos uma ação padrão
    return {
        "acoes": [],
        "justificativa": "Análise pendente de integração completa do LLM."
    }