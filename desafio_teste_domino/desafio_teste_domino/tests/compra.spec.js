// Comprar, passar e dicas (CT-DM-14 a 20).
import { abrirCenario, screen, pedra, jogar, codigosDa, vez, estoque, comprar, passar } from './helpers.js';

test('CT-DM-14 não pode comprar quem tem peça jogável', async () => {
  const user = await abrirCenario('COM_MONTE');
  await jogar(user, '6-6');
  expect(vez()).toHaveTextContent('Jogador 2'); // tem 6-1
  expect(estoque()).toHaveTextContent(/^2$/);
  expect(comprar()).toBeDisabled();
});

test('CT-DM-15 sem peça jogável, comprar traz a próxima peça do monte e a vez continua', async () => {
  const user = await abrirCenario('COMPRA');
  await jogar(user, '6-6');
  expect(comprar()).toBeEnabled();
  await user.click(comprar());
  expect(codigosDa(2)).toContain('0-1'); // primeira peça do monte
  expect(estoque()).toHaveTextContent(/^1$/);
  expect(vez()).toHaveTextContent('Jogador 2'); // 0-1 não serve: continua comprando
});

test('CT-DM-16 comprar até sair uma peça jogável, e então o botão fecha', async () => {
  const user = await abrirCenario('COMPRA');
  await jogar(user, '6-6');
  await user.click(comprar());
  await user.click(comprar());
  expect(codigosDa(2)).toContain('2-6');
  expect(estoque()).toHaveTextContent(/^0$/);
  expect(pedra('2-6')).toBeEnabled();
  expect(comprar()).toBeDisabled();
  await jogar(user, '2-6');
  expect(vez()).toHaveTextContent('Jogador 1');
});

test('CT-DM-17 monte vazio e sem peça jogável: comprar desabilitado, passar habilitado', async () => {
  const user = await abrirCenario('PASSE');
  await jogar(user, '6-6');
  await jogar(user, '6-1');
  expect(vez()).toHaveTextContent('Jogador 1'); // 0-3 não encaixa em 6 | 1
  expect(comprar()).toBeDisabled();
  expect(passar()).toBeEnabled();
});

test('CT-DM-18 passar só é permitido sem peça jogável E com o monte vazio', async () => {
  // (a) sem jogável, mas o monte ainda tem peças
  const a = await abrirCenario('COMPRA');
  await jogar(a, '6-6');
  expect(passar()).toBeDisabled();
  // (b) com jogável, monte vazio
  const b = await abrirCenario('BASICO');
  await jogar(b, '6-6');
  expect(passar()).toBeDisabled();
  // (c) sem jogável e monte vazio: passa e a vez muda
  const c = await abrirCenario('PASSE');
  await jogar(c, '6-6');
  await jogar(c, '6-1');
  await c.click(passar());
  expect(vez()).toHaveTextContent('Jogador 2');
});

test('CT-DM-19 dica: as peças que encaixam ficam com data-jogavel', async () => {
  const user = await abrirCenario('BASICO');
  await jogar(user, '6-6');
  expect(pedra('3-6')).toHaveAttribute('data-jogavel', 'true');
  expect(pedra('1-6')).toHaveAttribute('data-jogavel', 'true');
  expect(pedra('2-2')).not.toHaveAttribute('data-jogavel', 'true');
});

test('CT-DM-20 dica: sem peça jogável e com monte, o botão comprar é sugerido', async () => {
  const a = await abrirCenario('COMPRA');
  await jogar(a, '6-6');
  expect(comprar()).toHaveAttribute('data-sugerido', 'true');
  const b = await abrirCenario('COM_MONTE');
  await jogar(b, '6-6');
  expect(comprar()).not.toHaveAttribute('data-sugerido', 'true');
});
