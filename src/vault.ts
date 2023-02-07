import { Address, BigInt } from '@graphprotocol/graph-ts';
import { ExecutedOrder, Vault } from '../generated/schema';
import { ExecuteDCA, Cancel, Vault as VaultContract, Withdraw } from '../generated/templates/Vault/Vault';
import { Vault as VaultTemplate } from '../generated/templates';
import { getOrCreateToken } from './token';
import { CreateDCA } from '../generated/Factory/Factory';
import { getOrCreateFactory } from './factory';
import { sharesToAmount } from './bentoBox';

export function createVault(event: CreateDCA): Vault {
  const vault = new Vault(event.params.newVault.toHex());
  const contract = VaultContract.bind(event.params.newVault);

  const dcaData = contract.dcaData();

  vault.factory = getOrCreateFactory().id;
  vault.owner = contract.owner();

  vault.sellToken = getOrCreateToken(contract.sellToken()).id;
  vault.sellTokenPriceFeed = dcaData.value0;
  vault.sellTokenBalance = BigInt.fromU32(0);

  vault.buyToken = getOrCreateToken(contract.buyToken()).id;
  vault.buyTokenPriceFeed = dcaData.value1;
  vault.buyTokenBalance = BigInt.fromU32(0);

  vault.amount = dcaData.value4;
  vault.nextExecutableTimestamp = contract.lastBuy().plus(dcaData.value2);
  vault.epochDuration = dcaData.value2;
  vault.creationTimestamp = event.block.timestamp;
  vault.totalSell = BigInt.fromU32(0);
  vault.totalBuy = BigInt.fromU32(0);
  vault.active = true;

  vault.save();
  VaultTemplate.create(event.params.newVault);
  return vault;
}

function createExecutedOrder(event: ExecuteDCA, vault: Vault): ExecutedOrder {
  const executedOrder = new ExecutedOrder(event.transaction.hash.toHex());

  executedOrder.received = sharesToAmount(Address.fromString(vault.buyToken), event.params.received);
  executedOrder.timestamp = event.block.timestamp;
  executedOrder.vault = vault.id;
  executedOrder.executor = event.transaction.from;

  executedOrder.save();
  return executedOrder;
}

export function handleExecuteDCA(event: ExecuteDCA): void {
  const vault = Vault.load(event.address.toHex());
  if (vault === null) {
    return;
  }

  const executedOrder = createExecutedOrder(event, vault);

  vault.sellTokenBalance = vault.sellTokenBalance.minus(vault.amount);
  vault.nextExecutableTimestamp = event.block.timestamp.plus(vault.epochDuration);
  vault.totalSell = vault.totalSell.plus(vault.amount);
  vault.totalBuy = vault.totalBuy.plus(executedOrder.received);

  vault.save();
}

export function handleWithdraw(event: Withdraw): void {
  let vault = Vault.load(event.address.toHex());
  const token = event.params.token.toHex();
  if (vault === null || (token != vault.sellToken && token != vault.buyToken)) {
    return;
  }

  const amount = sharesToAmount(event.params.token, event.params.amount);

  if (token == vault.sellToken) {
    vault.sellTokenBalance = vault.sellTokenBalance.minus(amount);
  } else {
    vault.buyTokenBalance = vault.buyTokenBalance.minus(amount);
  }
  vault.save();
}

export function handleCancel(event: Cancel): void {
  let vault = Vault.load(event.address.toHex());
  if (vault === null) {
    return;
  }

  vault.active = false;
  vault.sellTokenBalance = BigInt.fromU32(0);
  vault.buyTokenBalance = BigInt.fromU32(0);
  vault.save();
}
