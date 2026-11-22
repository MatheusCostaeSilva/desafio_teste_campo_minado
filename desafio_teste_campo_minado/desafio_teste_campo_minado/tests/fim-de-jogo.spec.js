// Derrota, vitória e recomeço (CT-CM-21 a 26).
import { abrirJogo, screen, casa, estadoDe, casasNoEstado, todasAsCasas, clicar, marcar, bombasRestantes, tempo, aviso, CENARIO_FAIXAS, AVISO_VITORIA, AVISO_DERROTA, LINHAS, COLUNAS } from './helpers.js';

afterEach(() => {
  jest.useRealTimers();
});

test('CT-CM-21 derrota: a bomba clicada detona, as outras 39 aparecem e o campo trava', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  await clicar(user, 6, 0);
  expect(estadoDe(6, 0)).toBe('bomba-detonada');
  expect(casasNoEstado('bomba')).toHaveLength(39);
  expect(aviso()).toHaveTextContent(AVISO_DERROTA);
  await clicar(user, 0, 0); // depois de perder, nada abre
  expect(estadoDe(0, 0)).toBe('oculta');
});

test('CT-CM-22 derrota para o tempo', async () => {
  jest.useFakeTimers();
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS }, { advanceTimers: jest.advanceTimersByTime });
  await clicar(user, 5, 4);
  jest.advanceTimersByTime(3000);
  await clicar(user, 6, 4); // bomba
  const parado = tempo().textContent;
  jest.advanceTimersByTime(5000);
  expect(aviso()).toHaveTextContent(AVISO_DERROTA);
  expect(tempo()).toHaveTextContent(new RegExp(`^${parado}$`));
  expect(Number(parado)).toBeGreaterThanOrEqual(2);
});

test('CT-CM-23 marca errada é revelada na derrota; marca certa continua marcada', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  await marcar(user, 0, 0); // errada
  await marcar(user, 7, 0); // certa
  await clicar(user, 6, 5);
  expect(estadoDe(0, 0)).toBe('marca-errada');
  expect(estadoDe(7, 0)).toBe('marcada');
});

test('CT-CM-24 no modo aleatório sempre existem exatamente 40 bombas', async () => {
  const user = await abrirJogo();
  for (let l = 0; l < LINHAS; l++) {
    for (let c = 0; c < COLUNAS; c++) {
      if (aviso().textContent !== '') break;
      if (estadoDe(l, c) === 'oculta') await clicar(user, l, c);
    }
  }
  expect(aviso()).toHaveTextContent(AVISO_DERROTA);
  expect(casasNoEstado('bomba').length + casasNoEstado('bomba-detonada').length).toBe(40);
});

test('CT-CM-25 vitória: 212 casas seguras abertas, bombas marcadas, contador 0 e tempo parado', async () => {
  jest.useFakeTimers();
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS }, { advanceTimers: jest.advanceTimersByTime });
  await clicar(user, 0, 0);
  jest.advanceTimersByTime(2000);
  await clicar(user, 11, 0);
  expect(casasNoEstado('aberta')).toHaveLength(212);
  expect(casasNoEstado('marcada')).toHaveLength(40);
  expect(aviso()).toHaveTextContent(AVISO_VITORIA);
  expect(bombasRestantes()).toHaveTextContent(/^0$/);
  const parado = tempo().textContent;
  jest.advanceTimersByTime(4000);
  expect(tempo()).toHaveTextContent(new RegExp(`^${parado}$`));
});

test('CT-CM-26 marcar as 40 bombas sem abrir nada não dá vitória', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  for (const posicao of CENARIO_FAIXAS.split(',')) {
    const [l, c] = posicao.split('-').map(Number);
    await marcar(user, l, c);
  }
  expect(bombasRestantes()).toHaveTextContent(/^0$/);
  expect(aviso()).toBeEmptyDOMElement();
  expect(casasNoEstado('oculta')).toHaveLength(212);
});

test('CT-CM-27 recomeçar volta ao estado inicial', async () => {
  const user = await abrirJogo({ bombas: CENARIO_FAIXAS });
  await clicar(user, 0, 0);
  await marcar(user, 11, 0);
  await user.click(screen.getByTestId('btn-recomecar'));
  expect(todasAsCasas()).toHaveLength(252);
  expect(casasNoEstado('oculta')).toHaveLength(252);
  expect(bombasRestantes()).toHaveTextContent(/^40$/);
  expect(tempo()).toHaveTextContent(/^0$/);
  expect(aviso()).toBeEmptyDOMElement();
});
