// Utilitários dos testes de interface do Campo Minado (autor: MatheusCosta).
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

export const LINHAS = 14;
export const COLUNAS = 18;
export const TOTAL_BOMBAS = 40;
export const AVISO_VITORIA = 'Campo limpo! Você venceu.';
export const AVISO_DERROTA = 'BOOM! Você perdeu.';

/**
 * CENARIO_FAIXAS (40 bombas): linhas 6 e 7 inteiras (36) + (13,3), (13,9), (13,14), (13,15).
 * As duas faixas dividem o campo em duas regiões:
 *   - região de cima, linhas 0–5 (108 casas): clicar 0-0 abre tudo em cascata;
 *   - região de baixo, linhas 8–13 (104 casas seguras): clicar 11-0 abre tudo em cascata.
 * 108 + 104 = 212 = todas as casas seguras.
 */
export const CENARIO_FAIXAS = [
  ...Array.from({ length: COLUNAS }, (_, c) => `6-${c}`),
  ...Array.from({ length: COLUNAS }, (_, c) => `7-${c}`),
  '13-3', '13-9', '13-14', '13-15',
].join(',');

export const casa = (l, c) => screen.getByTestId(`casa-${l}-${c}`);
export const todasAsCasas = () => screen.getAllByTestId(/^casa-\d+-\d+$/);
export const casasNoEstado = (estado) => todasAsCasas().filter((e) => e.getAttribute('data-estado') === estado);
export const estadoDe = (l, c) => casa(l, c).getAttribute('data-estado');
export const clicar = (user, l, c) => user.click(casa(l, c));
export const marcar = (user, l, c) => user.pointer({ keys: '[MouseRight]', target: casa(l, c) });
export const duploClique = (user, l, c) => user.dblClick(casa(l, c));
export const bombasRestantes = () => screen.getByTestId('bombas-restantes');
export const tempo = () => screen.getByTestId('tempo');
export const aviso = () => screen.getByTestId('aviso');
