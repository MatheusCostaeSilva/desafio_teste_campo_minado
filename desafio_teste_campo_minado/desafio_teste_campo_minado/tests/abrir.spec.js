// Abrir casas, cascata e cronômetro (CT-CM-06 a 10).
import { abrirJogo, screen, casa, estadoDe, casasNoEstado, clicar, marcar, bombasRestantes, tempo, CENARIO_FAIXAS } from './helpers.js';

afterEach(() => {
  jest.useRealTimers();
});

const linhaDe = (elemento) => Number(elemento.getAttribute('data-testid').split('-')[1]);

test('CT-CM-06 cascata de cima: clicar 0-0 abre as linhas 0 a 5 e para na faixa de bombas', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  await clicar(user, 0, 0);
  const abertas = casasNoEstado('aberta');
  expect(abertas).toHaveLength(108); // 6 linhas × 18 colunas
  expect(Math.max(...abertas.map(linhaDe))).toBe(5);
  expect(estadoDe(8, 0)).toBe('oculta');
});

test('CT-CM-07 cascata de baixo: clicar 11-0 abre as 104 casas seguras das linhas 8 a 13', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  await clicar(user, 11, 0);
  const abertas = casasNoEstado('aberta');
  expect(abertas).toHaveLength(104); // 6 × 18 − 4 bombas
  expect(Math.min(...abertas.map(linhaDe))).toBe(8);
  expect(estadoDe(13, 3)).toBe('oculta'); // bomba continua escondida
  expect(estadoDe(5, 0)).toBe('oculta');
});

test('CT-CM-08 casa sem bombas por perto abre com vizinhas = 0', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  await clicar(user, 0, 0);
  expect(casa(0, 0)).toHaveAttribute('data-vizinhas', '0');
  expect(casa(4, 9)).toHaveAttribute('data-vizinhas', '0');
  expect(casa(5, 9)).toHaveAttribute('data-vizinhas', '3'); // borda da cascata mostra número
});

test('CT-CM-09 casa já aberta não muda com novos cliques', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  await clicar(user, 5, 4); // mostra 3, abre só ela
  await clicar(user, 5, 4);
  await marcar(user, 5, 4);
  expect(estadoDe(5, 4)).toBe('aberta');
  expect(casa(5, 4)).toHaveAttribute('data-vizinhas', '3');
  expect(casasNoEstado('aberta')).toHaveLength(1);
  expect(bombasRestantes()).toHaveTextContent(/^40$/);
});

test('CT-CM-10 o tempo só começa a contar no primeiro clique', async () => {
  jest.useFakeTimers();
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS }, { advanceTimers: jest.advanceTimersByTime });
  const segundos = () => Number(tempo().textContent);

  jest.advanceTimersByTime(3000);
  expect(tempo()).toHaveTextContent(/^0$/);

  await clicar(user, 0, 0);
  jest.advanceTimersByTime(3000);
  const depois = segundos();
  expect(depois).toBeGreaterThanOrEqual(2);
  jest.advanceTimersByTime(2000);
  expect(segundos()).toBeGreaterThan(depois);
});
