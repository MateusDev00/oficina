import { Router } from 'express';
import { z } from 'zod';
import { validar } from '../../intermediarios/validacao';
import { autenticar, autorizar } from '../../intermediarios/autenticacao';
import ordensServico from './ordens.servico';

const router = Router();

const criarOrdemSchema = z.object({
  body: z.object({
    cliente_id: z.number().int().positive(),
    veiculo_id: z.number().int().positive(),
    descricao: z.string().min(10),
    data_agendada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    prioridade: z.enum(['baixa', 'media', 'alta']).optional(),
    servicos_ids: z.array(z.number().int().positive()).optional(),
    pecas: z.array(z.object({
      peca_id: z.number().int().positive(),
      quantidade: z.number().int().positive()
    })).optional()
  })
});

router.get('/', autenticar, ordensServico.listar);
router.get('/:id', autenticar, ordensServico.obterPorId);
router.post('/', autenticar, autorizar('administrador', 'tecnico'), validar(criarOrdemSchema), ordensServico.criar);
router.patch('/:id/status', autenticar, autorizar('tecnico', 'administrador'), ordensServico.atualizarStatus);
router.patch('/:id/tecnico', autenticar, autorizar('administrador'), ordensServico.atribuirTecnico);
router.post('/:id/pagamento', autenticar, autorizar('administrador'), ordensServico.registarPagamento);

export default router;