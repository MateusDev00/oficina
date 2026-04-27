from datetime import date, timedelta

def aplicar_regras_duras(tipo_evento: str, payload: dict) -> dict:
    acoes = []
    resolvido = False

    if tipo_evento == "ORDEM_ATRASADA":
        dias_atraso = payload.get("dias_atraso", 0)
        ordem_id = payload.get("ordem_id")
        cliente_id = payload.get("cliente_id")

        if dias_atraso > 2:
            acoes.append({
                "tipo": "priorizar_ordem",
                "parametros": {"ordem_id": ordem_id, "nova_prioridade": "alta"}
            })
            acoes.append({
                "tipo": "reagendar_ordem",
                "parametros": {
                    "ordem_id": ordem_id,
                    "nova_data": (date.today() + timedelta(days=1)).isoformat(),
                    "motivo": "atraso superior a 2 dias"
                }
            })
            acoes.append({
                "tipo": "notificar_cliente",
                "parametros": {
                    "cliente_id": cliente_id,
                    "mensagem": "Sua ordem está atrasada. Foi reagendada automaticamente."
                }
            })
            resolvido = True

        elif dias_atraso == 1:
            acoes.append({
                "tipo": "notificar_cliente",
                "parametros": {
                    "cliente_id": cliente_id,
                    "mensagem": "Sua ordem está com 1 dia de atraso. Acompanhe o estado."
                }
            })
            resolvido = True

    elif tipo_evento == "TECNICO_INDISPONIVEL":
        tecnico_id = payload.get("tecnico_id")
        acoes.append({
            "tipo": "realocar_ordens",
            "parametros": {"tecnico_id": tecnico_id}
        })
        resolvido = True

    elif tipo_evento == "PAGAMENTO_CONFIRMADO":
        ordem_id = payload.get("ordem_id")
        cliente_id = payload.get("cliente_id")
        acoes.append({
            "tipo": "notificar_cliente",
            "parametros": {
                "cliente_id": cliente_id,
                "mensagem": "Pagamento confirmado. Obrigado!"
            }
        })
        resolvido = True

    return {"resolvido": resolvido, "acoes": acoes}