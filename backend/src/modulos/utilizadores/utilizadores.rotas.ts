import { Router } from 'express';
import { autenticar, autorizar } from '../../intermediarios/autenticacao';
import utilizadoresServico from './utilizadores.servico';

const router = Router();

router.get('/', autenticar, autorizar('administrador'), utilizadoresServico.listar);
router.get('/:id', autenticar, utilizadoresServico.obterPorId);
router.put('/:id', autenticar, utilizadoresServico.atualizar);
router.patch('/:id/disponibilidade', autenticar, autorizar('tecnico', 'administrador'), utilizadoresServico.atualizarDisponibilidade);
router.delete('/:id', autenticar, autorizar('administrador'), utilizadoresServico.remover);

export default router;