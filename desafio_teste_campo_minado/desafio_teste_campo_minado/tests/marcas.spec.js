// Marcas (bandeiras), limite de 40, abertura rápida e modo marcação (CT-CM-11 a 20).
import { abrirJogo, screen, casa, estadoDe, casasNoEstado, clicar, marcar, duploClique, bombasRestantes, aviso, CENARIO_FAIXAS, AVISO_DERROTA } from './helpers.js';

test('CT-CM-11 clique direito marca uma casa oculta e desconta do contador', async () => {
  const user = await abrirJogo();
  await marcar(user, 3, 3);
  expect(estadoDe(3, 3)).toBe('marcada');
  expect(bombasRestantes()).toHaveTextContent(/^39$/);
});

test('CT-CM-12 segundo clique direito tira a marca e devolve o contador', async () => {
  const user = await abrirJogo();
  await marcar(user, 3, 3);
  await marcar(user, 3, 3);
  expect(estadoDe(3, 3)).toBe('oculta');
  expect(bombasRestantes()).toHaveTextContent(/^40$/);
});

test('CT-CM-13 casa marcada está protegida do clique esquerdo', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  await marcar(user, 6, 0); // é bomba
  await clicar(user, 6, 0);
  expect(estadoDe(6, 0)).toBe('marcada');
  expect(aviso()).toBeEmptyDOMElement();
});

test('CT-CM-14 não é possível usar mais de 40 marcas', async () => {
  const user = await abrirJogo();
  for (let i = 0; i < 40; i++) await marcar(user, Math.floor(i / 18), i % 18); // 0-0 … 2-3
  expect(bombasRestantes()).toHaveTextContent(/^0$/);
  await marcar(user, 13, 17); // 41ª marca
  expect(estadoDe(13, 17)).toBe('oculta');
  expect(bombasRestantes()).toHaveTextContent(/^0$/);
  expect(casasNoEstado('marcada')).toHaveLength(40);
});

test('CT-CM-15 a cascata não abre casas marcadas', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  await marcar(user, 2, 2); // casa segura, marcada por engano
  await clicar(user, 0, 0);
  expect(estadoDe(2, 2)).toBe('marcada');
  expect(casasNoEstado('aberta')).toHaveLength(107);
  expect(bombasRestantes()).toHaveTextContent(/^39$/);
});

test('CT-CM-16 abertura rápida: clique duplo em número com as marcas certas abre as vizinhas', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  await clicar(user, 5, 0); // vale 2: bombas em 6-0 e 6-1
  await marcar(user, 6, 0);
  await marcar(user, 6, 1);
  await duploClique(user, 5, 0);
  for (const [l, c] of [[4, 0], [4, 1], [5, 1]]) expect(estadoDe(l, c)).toBe('aberta');
  expect(aviso()).toBeEmptyDOMElement();
});

test('CT-CM-17 abertura rápida com marcas a menos não abre nada', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  await clicar(user, 5, 0); // vale 2
  await marcar(user, 6, 0); // só 1 marca
  await duploClique(user, 5, 0);
  for (const [l, c] of [[4, 0], [4, 1], [5, 1]]) expect(estadoDe(l, c)).toBe('oculta');
});

test('CT-CM-18 abertura rápida com uma marca errada detona a bomba escondida', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  await clicar(user, 5, 0); // vale 2
  await marcar(user, 6, 0); // certa
  await marcar(user, 4, 1); // errada (casa segura)
  await duploClique(user, 5, 0); // 2 marcas = 2: abre as sem marca, inclusive a bomba 6-1
  expect(estadoDe(6, 1)).toBe('bomba-detonada');
  expect(aviso()).toHaveTextContent(AVISO_DERROTA);
  expect(estadoDe(4, 1)).toBe('marca-errada');
});

test('CT-CM-19 modo marcação: o clique esquerdo marca e desmarca', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  await user.click(screen.getByTestId('btn-modo-marcacao'));
  await clicar(user, 3, 3);
  expect(estadoDe(3, 3)).toBe('marcada');
  expect(bombasRestantes()).toHaveTextContent(/^39$/);
  await clicar(user, 3, 3);
  expect(estadoDe(3, 3)).toBe('oculta');
  expect(bombasRestantes()).toHaveTextContent(/^40$/);
});

test('CT-CM-20 modo marcação em cima de uma bomba não derrota; desligado, o clique volta a abrir', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  const botao = screen.getByTestId('btn-modo-marcacao');
  await user.click(botao);
  await clicar(user, 7, 0); // bomba
  expect(estadoDe(7, 0)).toBe('marcada');
  expect(aviso()).toBeEmptyDOMElement();
  await user.click(botao); // desliga
  await clicar(user, 0, 0);
  expect(estadoDe(0, 0)).toBe('aberta');
});
