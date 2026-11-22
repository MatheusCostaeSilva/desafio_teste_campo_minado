// Histórico da partida (CT-DM-25 e 26).
import { abrirCenario, jogar, comprar, passar, historico } from './helpers.js';

test('CT-DM-25 o histórico registra jogou e comprou, com o jogador de cada ação', async () => {
  const user = await abrirCenario('COMPRA');
  await jogar(user, '6-6');
  await user.click(comprar());
  await user.click(comprar());
  await jogar(user, '2-6');
  expect(historico('data-acao')).toEqual(['jogou', 'comprou', 'comprou', 'jogou']);
  expect(historico('data-jogador')).toEqual(['1', '2', '2', '2']);
});

test('CT-DM-26 o histórico registra o passe', async () => {
  const user = await abrirCenario('PASSE');
  await jogar(user, '6-6');
  await jogar(user, '6-1');
  await user.click(passar());
  await jogar(user, '1-1');
  expect(historico('data-acao')).toEqual(['jogou', 'jogou', 'passou', 'jogou']);
  expect(historico('data-jogador')).toEqual(['1', '2', '1', '2']);
});
