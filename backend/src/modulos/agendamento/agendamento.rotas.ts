import { Router } from 'express';
import { z } from 'zod';
import { validar } from '../../intermediarios/validacao';
import { autenticar, autorizar } from '../../intermediarios/autenticacao';
import agendamentoServico from './agendamento.servico';

const router = Router();

const verificarDisponibilidadeSchema = z.object({
  query: z.object({
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  })
});

const criarAgendamentoSchema = z.object({
  body: z.object({
    cliente_id: z.number().int().positive(),
    veiculo_id: z.number().int().positive(),
    descricao: z.string().min(10),
    data_agendada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    hora_agendada: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    servicos_ids: z.array(z.number().int().positive()).optional()
  })
});

router.get(
  '/disponibilidade',
  autenticar,
  validar(verificarDisponibilidadeSchema),
  agendamentoServico.verificarDisponibilidade
);

router.post(
  '/',
  autenticar,
  autorizar('cliente', 'administrador'),
  validar(criarAgendamentoSchema),
  agendamentoServico.criarAgendamento
);

router.get(
  '/tecnicos',
  autenticar,
  agendamentoServico.listarTecnicosDisponiveis
);

export default router;