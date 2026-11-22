// Campo e números (CT-CM-01 a 05). O jogo não existe: estes testes falham de propósito.
import { abrirJogo, screen, casa, todasAsCasas, estadoDe, clicar, bombasRestantes, tempo, aviso, LINHAS, COLUNAS, CENARIO_FAIXAS } from './helpers.js';

test('CT-CM-01 campo de 18 colunas × 14 linhas com 252 casas ocultas', async () => {
  await abrirJogo();
  expect(todasAsCasas()).toHaveLength(LINHAS * COLUNAS);
  for (let l = 0; l < LINHAS; l++) {
    for (let c = 0; c < COLUNAS; c++) expect(estadoDe(l, c)).toBe('oculta');
  }
  expect(screen.queryByTestId('casa-14-0')).toBeNull();
  expect(screen.queryByTestId('casa-0-18')).toBeNull();
});

test('CT-CM-02 estado inicial: 40 bombas restantes, tempo 0 e aviso vazio', async () => {
  await abrirJogo();
  expect(bombasRestantes()).toHaveTextContent(/^40$/);
  expect(tempo()).toHaveTextContent(/^0$/);
  expect(aviso()).toBeEmptyDOMElement();
});

test('CT-CM-03 o primeiro clique nunca cai numa bomba (40 partidas, clique no canto)', async () => {
  for (let i = 0; i < 40; i++) {
    const user = await abrirJogo();
    await clicar(user, 13, 17);
    expect(estadoDe(13, 17)).toBe('aberta');
  }
});

test('CT-CM-04 o primeiro clique abre uma área livre (casa clicada vale 0 e as 8 vizinhas abrem)', async () => {
  for (let i = 0; i < 25; i++) {
    const user = await abrirJogo();
    await clicar(user, 6, 8);
    expect(casa(6, 8)).toHaveAttribute('data-vizinhas', '0');
    for (const [l, c] of [[5, 7], [5, 8], [5, 9], [6, 7], [6, 9], [7, 7], [7, 8], [7, 9]]) {
      expect(estadoDe(l, c)).toBe('aberta');
    }
  }
});

test('CT-CM-05 cada número conta as bombas das 8 vizinhas', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  // linha 5 encosta na faixa da linha 6; linha 8 encosta na faixa da linha 7; (13,2) encosta em 13-3
  const esperado = { '5-0': '2', '5-4': '3', '5-17': '2', '8-5': '3', '8-17': '2', '13-2': '1' };
  for (const [posicao, valor] of Object.entries(esperado)) {
    const [l, c] = posicao.split('-').map(Number);
    await clicar(user, l, c);
    expect(estadoDe(l, c)).toBe('aberta');
    expect(casa(l, c)).toHaveAttribute('data-vizinhas', valor);
  }
});
