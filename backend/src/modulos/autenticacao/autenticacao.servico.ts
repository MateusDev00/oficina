import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../../configuracao/base_de_dados';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../configuracao/ambiente';
import { Utilizador } from '../../tipos';
import redis from '../../configuracao/redis';

interface DadosRegistro {
  nome: string;
  telefone: string;
  senha: string;
  email?: string;
}

class AutenticacaoServico {
  async login(telefone: string, senha: string): Promise<{ token: string; utilizador: Omit<Utilizador, 'hash_senha'> }> {
    const result = await query(
      'SELECT * FROM utilizadores WHERE telefone = $1',
      [telefone]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Credenciais inválidas');
    }
    
    const utilizador = result.rows[0] as Utilizador;
    const senhaValida = await bcrypt.compare(senha, utilizador.hash_senha);
    
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }
    
    if (!utilizador.disponivel) {
      throw new Error('Utilizador inativo. Contacte o administrador.');
    }
    
    const token = jwt.sign(
      { id: utilizador.id, papel: utilizador.papel },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    const { hash_senha, ...utilizadorSemSenha } = utilizador;
    return { token, utilizador: utilizadorSemSenha };
  }

  async registro(dados: DadosRegistro): Promise<Utilizador> {
    const existente = await query(
      'SELECT id FROM utilizadores WHERE telefone = $1',
      [dados.telefone]
    );
    
    if (existente.rows.length > 0) {
      throw new Error('Telefone já cadastrado');
    }
    
    if (dados.email) {
      const emailExistente = await query(
        'SELECT id FROM utilizadores WHERE email = $1',
        [dados.email]
      );
      if (emailExistente.rows.length > 0) {
        throw new Error('E-mail já cadastrado');
      }
    }
    
    const hash_senha = await bcrypt.hash(dados.senha, 10);
    
    const result = await query(
      `INSERT INTO utilizadores (nome, telefone, email, hash_senha, papel, disponivel)
       VALUES ($1, $2, $3, $4, 'cliente', true)
       RETURNING *`,
      [dados.nome, dados.telefone, dados.email || null, hash_senha]
    );
    
    return result.rows[0] as Utilizador;
  }

  async verificarToken(token: string): Promise<boolean> {
    try {
      jwt.verify(token, JWT_SECRET);
      return true;
    } catch {
      return false;
    }
  }

  async solicitarRecuperacaoSenha(telefone: string): Promise<void> {
    const result = await query(
      'SELECT id, nome FROM utilizadores WHERE telefone = $1',
      [telefone]
    );
    if (result.rows.length === 0) {
      return; // Não revela se existe ou não
    }
    
    const utilizador = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiraEm = 3600; // 1 hora
    
    await redis.setex(`recuperacao:${token}`, expiraEm, utilizador.id.toString());
    
    // Aqui seria feita a integração com envio de SMS/WhatsApp
    console.log(`Token de recuperação para ${telefone}: ${token}`);
    
    // Inserir notificação
    await query(
      `INSERT INTO notificacoes (utilizador_id, canal, conteudo, estado)
       VALUES ($1, 'whatsapp', $2, 'pendente')`,
      [utilizador.id, `Seu código de recuperação: ${token.substring(0, 8)}`]
    );
  }

  async redefinirSenha(token: string, novaSenha: string): Promise<void> {
    const utilizadorId = await redis.get(`recuperacao:${token}`);
    if (!utilizadorId) {
      throw new Error('Token inválido ou expirado');
    }
    
    const hash = await bcrypt.hash(novaSenha, 10);
    await query(
      'UPDATE utilizadores SET hash_senha = $1, atualizado_em = NOW() WHERE id = $2',
      [hash, utilizadorId]
    );
    
    await redis.del(`recuperacao:${token}`);
  }
}

export default new AutenticacaoServico();