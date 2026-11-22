// Batida, jogo trancado e nova partida (CT-DM-21 a 24).
import { abrirJogo, abrirCenario, screen, jogar, mesa, codigosDa, pedrasDa, aviso, estoque, placar, passar, historico } from './helpers.js';

test('CT-DM-21 batida: quem joga a última peça vence e marca os pontos que sobraram com o rival', async () => {
  const user = await abrirCenario('PASSE');
  await jogar(user, '6-6');
  await jogar(user, '6-1');
  await user.click(passar());
  await jogar(user, '1-1'); // última peça do J2
  expect(aviso()).toHaveTextContent('Jogador 2 bateu!');
  expect(placar(2)).toHaveTextContent(/^3$/); // sobrou 0-3 na mão do J1
  expect(placar(1)).toHaveTextContent(/^0$/);
});

test('CT-DM-22 jogo trancado: vence quem tem menos pontos na mão e marca os pontos do rival', async () => {
  const user = await abrirCenario('BASICO');
  await jogar(user, '6-6');
  await jogar(user, '3-6');
  await jogar(user, '1-3');
  await jogar(user, '1-6');
  await user.click(screen.getByTestId('btn-lado-esq')); // pontas 1 | 1: ninguém joga, monte vazio
  expect(aviso()).toHaveTextContent('Jogo trancado — Jogador 1 venceu!');
  expect(placar(1)).toHaveTextContent(/^4$/); // J1 ficou com 0-0 (0); J2 com 2-2 (4)
  expect(placar(2)).toHaveTextContent(/^0$/);
});

test('CT-DM-23 jogo trancado com somas iguais termina empatado e sem pontos', async () => {
  const user = await abrirCenario('EMPATE');
  await jogar(user, '6-6');
  await jogar(user, '6-1'); // J1 fica com 2-4 (6) e J2 com 3-3 (6)
  expect(aviso()).toHaveTextContent('Empate');
  expect(placar(1)).toHaveTextContent(/^0$/);
  expect(placar(2)).toHaveTextContent(/^0$/);
});

test('CT-DM-24 nova partida limpa mesa, monte e histórico, e mantém o placar acumulado', async () => {
  const user = await abrirCenario('PASSE');
  await jogar(user, '6-6');
  await jogar(user, '6-1');
  await user.click(passar());
  await jogar(user, '1-1');
  expect(placar(2)).toHaveTextContent(/^3$/);
  await user.click(screen.getByTestId('btn-nova-partida'));
  expect(mesa()).toHaveLength(0);
  expect(pedrasDa(1)).toHaveLength(7);
  expect(pedrasDa(2)).toHaveLength(7);
  expect(estoque()).toHaveTextContent(/^14$/);
  expect(aviso()).toBeEmptyDOMElement();
  expect(historico('data-acao')).toHaveLength(0);
  expect(placar(2)).toHaveTextContent(/^3$/);
});
