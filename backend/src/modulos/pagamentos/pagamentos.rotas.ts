import { Router } from 'express';
import { autenticar, autorizar } from '../../intermediarios/autenticacao';
import pagamentosServico from './pagamentos.servico';

const router = Router();

router.get('/', autenticar, autorizar('administrador'), pagamentosServico.listar);
router.get('/:id', autenticar, pagamentosServico.obterPorId);

export default router;