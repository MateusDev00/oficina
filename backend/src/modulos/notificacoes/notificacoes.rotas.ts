import { Router } from 'express';
import { autenticar, autorizar } from '../../intermediarios/autenticacao';
import notificacoesServico from './notificacoes.servico';

const router = Router();

router.get('/', autenticar, notificacoesServico.listar);
router.post('/:id/reenviar', autenticar, autorizar('administrador'), notificacoesServico.reenviar);

export default router;