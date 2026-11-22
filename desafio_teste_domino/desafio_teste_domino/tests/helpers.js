// Utilitários dos testes de interface do Dominó (autor: MatheusCosta).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

/** Abre a página como o jogador abriria. `params` são os parâmetros de URL do contrato. */
export async function abrirJogo(params = {}, opcoesUser = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params));
  document.body.innerHTML = corpo;
  jest.resetModules();
  await import('../js/main.js');
  return userEvent.setup(opcoesUser);
}

export { screen };

/**
 * Cenários fixos (mãos e monte pequenos). Todos conferidos jogada a jogada por um mini-motor.
 * Com `mao1`/`mao2`/`estoque` na URL a partida já começa ao abrir a página.
 */
export const CENARIOS = {
  // J1 começa (6-6). Jogando 6-6, 3-6, 1-3 e 1-6 (à esquerda) o jogo tranca e o J1 vence com 4 pontos.
  BASICO: { mao1: '6-6,1-3,0-0', mao2: '3-6,1-6,2-2', estoque: '' },
  // Como o BASICO, mas ninguém tranca depois da escolha de lado: J1 guarda 0-6 e J2 guarda 1-5.
  LADOS: { mao1: '6-6,1-3,0-6', mao2: '3-6,1-6,1-5', estoque: '' },
  // J1 joga 6-6; J2 não tem 6 e precisa comprar (0-1 não serve, 2-6 serve).
  COMPRA: { mao1: '6-6,0-0', mao2: '1-2,3-4', estoque: '0-1,2-6' },
  // J1 joga 6-6, J2 joga 6-1; J1 (0-3) não consegue jogar e passa; J2 bate com 1-1 e marca 3.
  PASSE: { mao1: '6-6,0-3', mao2: '6-1,1-1', estoque: '' },
  // J1 joga 6-6, J2 joga 6-1: tranca com 6 pontos para cada lado (2-4 e 3-3).
  EMPATE: { mao1: '6-6,2-4', mao2: '6-1,3-3', estoque: '' },
  // Ninguém tem dupla: J2 começa com 5-6 (11 pontos, a maior soma).
  SEM_DUPLA: { mao1: '1-2,0-3,4-6', mao2: '5-6,0-1,2-3', estoque: '' },
  // Duplas nas duas mãos: J1 começa com 5-5 (4-4 do J2 é menor).
  DUAS_DUPLAS: { mao1: '5-5,1-2,0-3', mao2: '4-4,0-1,2-6', estoque: '' },
  // J1 joga 6-6; J2 tem 6-1 jogável e o monte ainda tem 2 peças.
  COM_MONTE: { mao1: '6-6,0-0', mao2: '6-1,2-3', estoque: '4-4,5-5' },
};

export const abrirCenario = (nome, opcoes = {}) => abrirJogo(CENARIOS[nome], opcoes);

export const pedra = (codigo) => screen.getByTestId(`pedra-${codigo}`);
export const jogar = (user, codigo) => user.click(pedra(codigo));
export const mesa = () => Array.from(screen.getByTestId('mesa').children).map((e) => e.getAttribute('data-pedra'));
export const extremos = () => [screen.getByTestId('extremo-esq').textContent, screen.getByTestId('extremo-dir').textContent];
export const pedrasDa = (mao) => Array.from(screen.getByTestId(`mao-${mao}`).querySelectorAll('[data-testid^="pedra-"]'));
export const codigosDa = (mao) => pedrasDa(mao).map((e) => e.getAttribute('data-testid').replace('pedra-', ''));
export const vez = () => screen.getByTestId('jogador-da-vez');
export const aviso = () => screen.getByTestId('aviso');
export const estoque = () => screen.getByTestId('estoque-qtd');
export const placar = (jogador) => screen.getByTestId(`placar-${jogador}`);
export const historico = (atributo) => Array.from(screen.getByTestId('historico').children).map((e) => e.getAttribute(atributo));
export const comprar = () => screen.getByTestId('btn-comprar');
export const passar = () => screen.getByTestId('btn-passar');
