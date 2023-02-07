import { LogTransfer, LogDeposit } from './../generated/BentoBox/BentoBox';
import { BentoBox } from './../generated/BentoBox/BentoBox';
import { Vault } from '../generated/schema';
import { BENTOBOX } from './constants';
import { Address, BigInt } from '@graphprotocol/graph-ts';

export function handleLogTransfer(event: LogTransfer): void {
  const vault = Vault.load(event.params.to.toHex());
  const token = event.params.token.toHex();
  if (vault === null || (token != vault.sellToken && token != vault.buyToken)) {
    return;
  }

  const amount = sharesToAmount(event.params.token, event.params.share);

  if (token == vault.sellToken) {
    vault.sellTokenBalance = vault.sellTokenBalance.plus(amount);
  } else {
    vault.buyTokenBalance = vault.buyTokenBalance.plus(amount);
  }

  vault.save();
}

export function handleLogDeposit(event: LogDeposit): void {
  const vault = Vault.load(event.params.to.toHex());
  const token = event.params.token.toHex();
  if (vault === null || (token != vault.sellToken && token != vault.buyToken)) {
    return;
  }

  const amount = sharesToAmount(event.params.token, event.params.share);

  if (token == vault.sellToken) {
    vault.sellTokenBalance = vault.sellTokenBalance.plus(amount);
  } else {
    vault.buyTokenBalance = vault.buyTokenBalance.plus(amount);
  }

  vault.save();
}

export function sharesToAmount(token: Address, shares: BigInt): BigInt {
  const bento = BentoBox.bind(Address.fromString(BENTOBOX));
  return bento.toAmount(token, shares, false);
}
