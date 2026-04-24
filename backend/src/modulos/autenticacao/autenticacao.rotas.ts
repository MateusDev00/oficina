import { Router } from 'express';
import { z } from 'zod';
import { validar } from '../../intermediarios/validacao';
import autenticacaoControlador from './autenticacao.controlador';

const router = Router();

const loginSchema = z.object({
  body: z.object({
    telefone: z.string().min(9, 'Telefone deve ter pelo menos 9 dígitos'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
  })
});

const registroSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    telefone: z.string().min(9, 'Telefone deve ter pelo menos 9 dígitos'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    email: z.string().email('E-mail inválido').optional()
  })
});

const recuperarSenhaSchema = z.object({
  body: z.object({
    telefone: z.string().min(9)
  })
});

const redefinirSenhaSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    novaSenha: z.string().min(6)
  })
});

router.post('/login', validar(loginSchema), autenticacaoControlador.login);
router.post('/registro', validar(registroSchema), autenticacaoControlador.registro);
router.post('/logout', autenticacaoControlador.logout);
router.post('/recuperar-senha', validar(recuperarSenhaSchema), autenticacaoControlador.recuperarSenha);
router.post('/redefinir-senha', validar(redefinirSenhaSchema), autenticacaoControlador.redefinirSenha);
router.get('/verificar', autenticacaoControlador.verificarToken);

export default router;